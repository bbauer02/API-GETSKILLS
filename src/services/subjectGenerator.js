/**
 * Service pour la génération automatique de sujets d'examen
 * Implémente un algorithme de sélection des questions qui respecte les contraintes:
 * - Equilibre entre compétences
 * - Répartition des types de questions
 * - Respect des limites de points et durée
 */
const { models, Sequelize } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');

/**
 * Génère un sujet d'examen en fonction des paramètres fournis
 * @param {Object} examData - Les données du sujet à générer
 * @param {Object} options - Options additionnelles
 * @param {Object} options.transaction - Transaction Sequelize optionnelle
 * @returns {Object} - Le sujet généré avec ses questions
 */
async function generateExamSubject(examData, options = {}) {
    if (!examData || !examData.test_id) {
        throw new Error('test_id est requis pour générer un sujet');
    }

    // Extraction des données de l'examen
    const { 
        test_id, 
        level_id, 
        totalPoints = 1200, 
        totalDuration = 21600,  // 6 heures en secondes
        title,
        description,
        minQuestionCount = 10   // Nombre minimum de questions requis
    } = examData;

    console.log(`
======================================================
GÉNÉRATION DE SUJET
------------------------------------------------------
Test ID: ${test_id}
Niveau: ${level_id || 'Tous'}
Points attendus: ${totalPoints}
Durée attendue: ${totalDuration} secondes
Nombre minimum de questions: ${minQuestionCount}
======================================================
`);

    // Utiliser la transaction fournie ou en créer une nouvelle
    const transaction = options.transaction || await sequelize.transaction();
    let createdSubject = null;

    try {
        // Vérifier que le test a des compétences définies
        const testSkills = await models.Skill.findAll({
            where: { test_id },
            attributes: ['skill_id'],
            limit: 1
        });
        
        if (!testSkills || testSkills.length === 0) {
            throw new Error(`Impossible de générer un sujet pour le test_id=${test_id} car aucune compétence n'est définie pour ce test. Veuillez définir des compétences avant de générer un sujet.`);
        }
        
        // Vérifier qu'il existe des questions avec des compétences pour ce test et ce niveau
        const whereClause = { test_id };
        if (level_id) {
            whereClause.level_id = level_id;
        }
        
        const questionsCount = await models.Question.count({
            where: whereClause,
            include: [{
                model: models.Skill,
                attributes: [],
                as: 'skills',
                through: { attributes: [] },
                where: { test_id }
            }]
        });
        
        if (questionsCount === 0) {
            throw new Error(`Aucune question avec des compétences n'a été trouvée pour le test_id=${test_id}${level_id ? ` et level_id=${level_id}` : ''}. Veuillez ajouter des questions avec des compétences avant de générer un sujet.`);
        }
        
        // Récupérer les questions disponibles avec les statistiques requises
        let questions = await fetchAvailableQuestions(test_id, level_id, { 
            totalPoints, 
            totalDuration,
            ...examData
        });

        if (!questions || questions.length === 0) {
            throw new Error(`Aucune question disponible pour test_id=${test_id} et level_id=${level_id}`);
        }

        // Si nous n'avons pas assez de questions, chercher des questions dans d'autres tests
        // UNIQUEMENT si aucun level_id n'est spécifié (pour éviter de mélanger des niveaux différents)
        if (questions.length < minQuestionCount && !level_id) {
            console.log(`
ATTENTION : Seulement ${questions.length} questions disponibles, ce qui est inférieur 
au minimum requis de ${minQuestionCount}. Recherche de questions supplémentaires...`);
            
            // Récupérer les IDs de questions déjà trouvées
            const foundQuestionIds = questions.map(q => q.question_id);
            
            // Chercher des questions dans d'autres tests, de préférence avec des compétences similaires
            const otherTestQuestions = await models.Question.findAll({
                where: {
                    test_id: { [Op.ne]: test_id },
                    question_id: { [Op.notIn]: foundQuestionIds }
                },
                include: [
                    {
                        model: models.Skill,
                        attributes: ['skill_id', 'label', 'parent_id', 'test_id'],
                        through: { attributes: [] },
                        as: 'skills'
                    }
                ],
                limit: 50 // Limiter pour ne pas récupérer trop de questions inappropriées
            });
            
            console.log(`${otherTestQuestions.length} questions supplémentaires trouvées dans d'autres tests`);
            
            // Ajouter les nouvelles questions à notre sélection
            questions = [...questions, ...otherTestQuestions];
            
            console.log(`Nombre total de questions disponibles après recherche étendue: ${questions.length}`);
        } else if (questions.length < minQuestionCount && level_id) {
            console.log(`
ATTENTION : Seulement ${questions.length} questions disponibles pour le test_id=${test_id} et level_id=${level_id}, 
ce qui est inférieur au minimum requis de ${minQuestionCount}. 
La recherche de questions dans d'autres tests est désactivée car un level_id spécifique a été demandé.`);
        }

        // Récupérer les compétences pour le test sélectionné
        const skills = await fetchTestSkills(test_id);

        console.log(`${skills.length} compétences disponibles pour le test_id=${test_id}`);

        // Analyser les types de questions disponibles
        const questionTypes = analyzeQuestionTypes(questions);
        
        // Créer une distribution par défaut basée sur les questions disponibles
        const questionTypeDistribution = {};
        const totalQuestions = questions.length;
        
        Object.keys(questionTypes).forEach(type => {
            const typePercentage = Math.round((questionTypes[type].count / totalQuestions) * 100);
            questionTypeDistribution[type] = typePercentage;
        });
        
        console.log('Distribution des types de questions:', 
            Object.entries(questionTypeDistribution).map(([type, percent]) => `${type}: ${percent}%`).join(', ')
        );

        // Sélectionner les questions de manière équilibrée
        const selectedQuestions = selectBalancedQuestions(
            questions, 
            skills, 
            questionTypes,
            totalPoints,
            totalDuration
        );

        if (!selectedQuestions || selectedQuestions.length === 0) {
            throw new Error('Aucune question n\'a pu être sélectionnée pour le sujet');
        }

        console.log(`
RÉSUMÉ DE LA SÉLECTION
----------------------
Nombre de questions sélectionnées: ${selectedQuestions.length}
Nombre de questions disponibles initialement: ${questions.length}
`);
        
        // Calculer les statistiques finales du sujet
        let finalPoints = selectedQuestions.reduce((sum, q) => sum + (parseInt(q.points, 10) || 0), 0);
        let finalDuration = selectedQuestions.reduce((sum, q) => sum + (parseInt(q.duration, 10) || 0), 0);
        
        // Calculer le pourcentage d'atteinte des objectifs
        let pointsPercentage = Math.round((finalPoints / totalPoints) * 100);
        let durationPercentage = Math.round((finalDuration / totalDuration) * 100);
        
        // Vérifier si le sujet respecte les contraintes de durée et de points
        if (finalDuration > totalDuration) {
            console.warn(`
ATTENTION: La durée totale du sujet (${finalDuration} secondes) dépasse la durée maximale autorisée (${totalDuration} secondes).
Cela peut être dû à la difficulté de trouver des questions qui respectent exactement les contraintes.
`);
            
            // Si la durée dépasse de plus de 5%, essayer de retirer des questions pour se rapprocher de la limite
            if (finalDuration > totalDuration * 1.05) {
                console.log('Tentative d\'optimisation du sujet pour respecter la contrainte de durée...');
                
                // Trier les questions par rapport points/durée (efficacité) décroissant
                // pour retirer en priorité les questions les moins efficaces
                selectedQuestions.sort((a, b) => {
                    const efficiencyA = (a.points || 0) / Math.max(1, a.duration || 1);
                    const efficiencyB = (b.points || 0) / Math.max(1, b.duration || 1);
                    return efficiencyA - efficiencyB; // Ordre croissant pour retirer les moins efficaces en premier
                });
                
                // Retirer des questions jusqu'à respecter la contrainte de durée
                while (selectedQuestions.length > 0 && 
                       selectedQuestions.reduce((sum, q) => sum + (parseInt(q.duration, 10) || 0), 0) > totalDuration) {
                    const removedQuestion = selectedQuestions.shift(); // Retirer la question la moins efficace
                    console.log(`Question ${removedQuestion.question_id} retirée pour optimiser la durée (${removedQuestion.duration} secondes)`);
                }
                
                // Recalculer les statistiques après optimisation
                finalPoints = selectedQuestions.reduce((sum, q) => sum + (parseInt(q.points, 10) || 0), 0);
                finalDuration = selectedQuestions.reduce((sum, q) => sum + (parseInt(q.duration, 10) || 0), 0);
                
                console.log(`
APRÈS OPTIMISATION:
Points: ${finalPoints}/${totalPoints} (${Math.round((finalPoints / totalPoints) * 100)}%)
Durée: ${finalDuration}/${totalDuration} secondes (${Math.round((finalDuration / totalDuration) * 100)}%)
Nombre de questions: ${selectedQuestions.length}
`);
                
                // Mettre à jour les statistiques finales
                pointsPercentage = Math.round((finalPoints / totalPoints) * 100);
                durationPercentage = Math.round((finalDuration / totalDuration) * 100);
            }
        }
        
        console.log(`
STATISTIQUES FINALES DU SUJET
-----------------------------
Points: ${finalPoints}/${totalPoints} (${pointsPercentage}%)
Durée: ${finalDuration}/${totalDuration} secondes (${durationPercentage}%)
Nombre de questions: ${selectedQuestions.length}${selectedQuestions.length < minQuestionCount ? ' (INFÉRIEUR AU MINIMUM REQUIS)' : ''}
`);

        // Analyser la couverture des compétences
        const coveredSkills = new Set();
        selectedQuestions.forEach(q => {
            (q.skills || []).forEach(s => coveredSkills.add(s.skill_id));
        });
        
        // Éviter la division par zéro et afficher un message approprié
        if (skills.length === 0) {
            console.log(`Couverture des compétences: ${coveredSkills.size}/0 (Aucune compétence définie pour ce test)`);
        } else {
            const coveragePercentage = Math.round((coveredSkills.size / skills.length) * 100);
            console.log(`Couverture des compétences: ${coveredSkills.size}/${skills.length} (${coveragePercentage}%)`);
        }
        
        // Créer le sujet dans la base de données
        createdSubject = await createSubject(
            {
                title: title || `Sujet test_id=${test_id} level_id=${level_id || 'tous'}`,
                test_id,
                level_id: level_id || null,
                description: description || `Sujet généré automatiquement avec ${selectedQuestions.length} questions`
            },
            selectedQuestions,
            { transaction, ...options }
        );

        // Si la transaction a été créée ici, la valider
        if (!options.transaction) {
            await transaction.commit();
            console.log('Transaction validée avec succès');
        }

        return {
            subject_id: createdSubject.subject_id,
            name: createdSubject.name,
            test_id: createdSubject.test_id,
            level_id: createdSubject.level_id,
            questions: selectedQuestions,
            totalPoints: finalPoints,
            totalDuration: finalDuration,
            questionCount: selectedQuestions.length,
            coverageStats: {
                pointsPercentage,
                durationPercentage,
                skillsCovered: coveredSkills.size,
                skillsTotal: skills.length
            }
        };
    } catch (error) {
        // Si la transaction a été créée ici, l'annuler en cas d'erreur
        if (!options.transaction) {
            await transaction.rollback();
            console.error('Transaction annulée suite à une erreur:', error);
        }
        throw error;
    }
}

/**
 * Valide les données d'entrée pour la génération d'un sujet
 * @param {Object} examData - Les données du sujet à valider
 */
function validateExamData(examData) {
    // Vérifier que tous les champs obligatoires sont présents
    const requiredFields = ['title', 'test_id', 'totalDuration', 'totalPoints', 'requiredPoints'];
    
    requiredFields.forEach(field => {
        if (!examData[field]) {
            throw new Error(`Le champ ${field} est obligatoire`);
        }
    });

    // Vérifier que les valeurs numériques sont cohérentes
    if (examData.totalDuration <= 0) {
        throw new Error('La durée totale doit être supérieure à 0');
    }
    
    if (examData.totalPoints <= 0) {
        throw new Error('Le nombre de points doit être supérieur à 0');
    }
    
    if (examData.requiredPoints > examData.totalPoints) {
        throw new Error('Le nombre de points requis ne peut pas être supérieur au nombre total de points');
    }
}

/**
 * Récupère les questions disponibles pour un test et niveau donnés
 * @param {Number} testId - L'identifiant du test
 * @param {Number} levelId - L'identifiant du niveau (optionnel)
 * @param {Object} examData - Les données du sujet à générer
 * @returns {Array} - Les questions disponibles
 */
async function fetchAvailableQuestions(testId, levelId, examData) {
    console.log(`Recherche de questions disponibles pour test_id=${testId}${levelId ? ` et level_id=${levelId}` : ' (sans niveau)'}`);
    
    if (!testId) {
        console.error('test_id est requis pour la recherche de questions');
        return [];
    }

    const totalPoints = examData?.totalPoints || 0;
    const totalDuration = examData?.totalDuration || 0;
    const minQuestionCount = examData?.minQuestionCount || 10;
    
    console.log(`Objectifs: ${totalPoints} points, ${totalDuration} secondes, minimum ${minQuestionCount} questions`);

    try {
        // Construire la clause where en fonction de la présence ou non d'un niveau
        const whereClause = {
            test_id: testId
        };
        
        // Si un level_id est fourni, l'ajouter à la clause where
        if (levelId) {
            whereClause.level_id = levelId;
        }
        
        // ÉTAPE 1: Récupérer les questions disponibles qui n'ont jamais été utilisées dans un sujet
        const freshQuestions = await models.Question.findAll({
            where: whereClause,
            include: [{
                model: models.Skill,
                attributes: ['skill_id', 'label', 'parent_id', 'test_id'],  // Inclure les attributs pour vérification
                as: 'skills',
                through: { attributes: [] },
                where: { test_id: testId }  // S'assurer que les compétences correspondent au test_id
            }]
        });

        console.log(`Étape 1: ${freshQuestions.length} questions fraîches trouvées (jamais utilisées)`);
        
        // Vérifier que chaque question a au moins une compétence du test demandé
        const validFreshQuestions = freshQuestions.filter(question => {
            const hasValidSkills = question.skills && 
                                  question.skills.length > 0 && 
                                  question.skills.some(skill => skill.test_id === testId);
            
            if (!hasValidSkills) {
                console.warn(`Question ${question.question_id} ignorée: aucune compétence valide pour test_id=${testId}`);
            }
            
            return hasValidSkills;
        });
        
        if (validFreshQuestions.length < freshQuestions.length) {
            console.warn(`${freshQuestions.length - validFreshQuestions.length} questions ignorées car elles n'ont pas de compétences valides pour test_id=${testId}`);
        }
        
        // Calculer les points et la durée disponibles avec ces questions fraîches valides
        let availablePoints = 0;
        let availableDuration = 0;
        
        validFreshQuestions.forEach(question => {
            availablePoints += (question.points || 0);
            availableDuration += (question.duration || 0);
        });
        
        console.log(`Points disponibles avec questions fraîches: ${availablePoints}/${totalPoints} (${Math.round(availablePoints/totalPoints*100)}%)`);
        console.log(`Durée disponible avec questions fraîches: ${availableDuration}/${totalDuration} (${Math.round(availableDuration/totalDuration*100)}%)`);
        
        // Si nous avons suffisamment de questions fraîches, les utiliser
        if (validFreshQuestions.length >= minQuestionCount && 
            availablePoints >= totalPoints && 
            availableDuration >= totalDuration) {
            console.log('Suffisamment de questions fraîches disponibles. Utilisation exclusive de ces questions.');
            return validFreshQuestions;
        }
        
        // ÉTAPE 2: Si pas assez de questions fraîches, chercher dans les sujets précédents
        const freshQuestionIds = validFreshQuestions.map(q => q.question_id);
        
        console.log('Pas assez de questions fraîches. Recherche de questions dans les sujets précédents...');
        
        // Ajouter à la clause where la condition pour exclure les questions fraîches
        const previousWhereClause = {
            ...whereClause,
            question_id: {
                [Op.notIn]: freshQuestionIds
            }
        };
        
        const previouslyUsedQuestions = await models.Question.findAll({
            where: previousWhereClause,
            include: [{
                model: models.Skill,
                attributes: ['skill_id', 'label', 'parent_id', 'test_id'],
                as: 'skills',
                through: { attributes: [] },
                where: { test_id: testId }  // S'assurer que les compétences correspondent au test_id
            },
            {
                model: models.Subject,
                attributes: [],
                as: 'subjects',
                through: { attributes: [] }
            }
            ],
            // Ordonner par fréquence d'utilisation (privilégier les moins utilisées)
            order: [
                [sequelize.fn('COUNT', sequelize.col('subjects.subject_id')), 'ASC']
            ],
            group: ['Question.question_id']
        });
        
        console.log(`Étape 2: ${previouslyUsedQuestions.length} questions supplémentaires trouvées dans des sujets précédents`);
        
        // Vérifier que chaque question a au moins une compétence du test demandé
        const validPreviouslyUsedQuestions = previouslyUsedQuestions.filter(question => {
            const hasValidSkills = question.skills && 
                                  question.skills.length > 0 && 
                                  question.skills.some(skill => skill.test_id === testId);
            
            if (!hasValidSkills) {
                console.warn(`Question ${question.question_id} ignorée: aucune compétence valide pour test_id=${testId}`);
            }
            
            return hasValidSkills;
        });
        
        if (validPreviouslyUsedQuestions.length < previouslyUsedQuestions.length) {
            console.warn(`${previouslyUsedQuestions.length - validPreviouslyUsedQuestions.length} questions précédemment utilisées ignorées car elles n'ont pas de compétences valides pour test_id=${testId}`);
        }
        
        // Combiner les questions fraîches et celles des sujets précédents
        let combinedQuestions = [...validFreshQuestions, ...validPreviouslyUsedQuestions];
        
        // Recalculer les statistiques avec toutes les questions
        availablePoints = 0;
        availableDuration = 0;
        
        combinedQuestions.forEach(question => {
            availablePoints += (question.points || 0);
            availableDuration += (question.duration || 0);
        });
        
        console.log(`Points disponibles après étape 2: ${availablePoints}/${totalPoints} (${Math.round(availablePoints/totalPoints*100)}%)`);
        console.log(`Durée disponible après étape 2: ${availableDuration}/${totalDuration} (${Math.round(availableDuration/totalDuration*100)}%)`);
        
        // Vérifier si nous avons suffisamment de questions pour générer un sujet
        if (combinedQuestions.length < minQuestionCount || 
            availablePoints < totalPoints || 
            availableDuration < totalDuration) {
            console.log(`ATTENTION: Seulement ${combinedQuestions.length} questions disponibles totalisant ${availablePoints} points et ${availableDuration} secondes.`);
            console.log(`Cela peut être insuffisant pour générer un sujet de ${totalPoints} points et ${totalDuration} secondes.`);
            console.log("Aucune question supplémentaire ne sera ajoutée depuis d'autres tests ou niveaux conformément aux exigences.");
        }
        
        // Statistiques finales
        console.log(`Nombre total de questions disponibles: ${combinedQuestions.length}`);
        
        // Ordonner les questions pour privilégier les questions fraîches
        combinedQuestions.sort((a, b) => {
            // Si un niveau est spécifié, privilégier les questions du bon niveau
            if (levelId) {
                if (a.level_id === levelId && b.level_id !== levelId) return -1;
                if (a.level_id !== levelId && b.level_id === levelId) return 1;
            }
            
            // Ensuite, privilégier les questions jamais utilisées
            const aUsageCount = a.subjects?.length || 0;
            const bUsageCount = b.subjects?.length || 0;
            return aUsageCount - bUsageCount;
        });
        
        return combinedQuestions;
    } catch (error) {
        console.error('Erreur lors de la récupération des questions:', error);
        return [];
    }
}

/**
 * Récupère les compétences associées à un test
 * @param {number} testId - L'ID du test
 * @returns {Array} - Les compétences avec leurs poids
 */
async function fetchTestSkills(testId) {
    if (!testId) {
        console.error('ID de test invalide pour la récupération des compétences');
        return [];
    }

    try {
        console.log(`Récupération des compétences pour le test_id=${testId}`);
        
        // Récupérer les compétences avec leurs poids
        const skills = await models.Skill.findAll({
            where: { test_id: testId },
            attributes: ['skill_id', 'label', 'parent_id', 'test_id'],
            order: [['skill_id', 'ASC']] // Trier par ID de compétence
        });
        
        if (!skills || skills.length === 0) {
            console.warn(`Aucune compétence trouvée pour le test_id=${testId}`);
            return [];
        }
        
        // Ajouter un poids par défaut à chaque compétence (puisque ce champ n'existe pas dans le modèle)
        const skillsWithWeight = skills.map(skill => {
            const skillData = skill.get({ plain: true });
            skillData.weight = 1.0; // Poids par défaut
            return skillData;
        });
        
        // Afficher des statistiques sur les compétences trouvées
        const skillCount = skillsWithWeight.length;
        const weightStats = { total: skillCount, min: 1.0, max: 1.0 };
        const avgWeight = 1.0;
        
        console.log(`
COMPÉTENCES DU TEST
-------------------
Nombre de compétences: ${skillCount}
Poids moyen: ${avgWeight.toFixed(2)}
Poids minimum: ${weightStats.min.toFixed(2)}
Poids maximum: ${weightStats.max.toFixed(2)}
`);
        
        // Récupérer les questions associées à chaque compétence pour analyse
        const questionsPerSkill = await models.Skill.findAll({
            attributes: [
                'skill_id',
                [sequelize.fn('COUNT', sequelize.col('questions.question_id')), 'question_count']
            ],
            include: [{
                model: models.Question,
                attributes: [],
                as: 'questions',
                through: { attributes: [] }
            }],
            where: { test_id: testId },
            group: ['Skill.skill_id'],
            raw: true
        });
        
        // Mapper les statistiques sur les compétences
        const skillMap = {};
        questionsPerSkill.forEach(stat => {
            skillMap[stat.skill_id] = parseInt(stat.question_count, 10);
        });
        
        // Ajouter les statistiques aux compétences
        const enhancedSkills = skillsWithWeight.map(skill => {
            const skillData = skill;
            skillData.questionCount = skillMap[skill.skill_id] || 0;
            return skillData;
        });
        
        // Trier en fonction du nombre de questions (pour donner la priorité aux compétences avec moins de questions)
        enhancedSkills.sort((a, b) => {
            // D'abord par poids (décroissant)
            if (b.weight !== a.weight) {
                return b.weight - a.weight;
            }
            // Ensuite par nombre de questions (croissant)
            return a.questionCount - b.questionCount;
        });
        
        // Afficher les 5 premières compétences triées
        console.log('Top 5 des compétences prioritaires:');
        enhancedSkills.slice(0, 5).forEach((skill, index) => {
            console.log(`${index + 1}. ${skill.label} (poids: ${skill.weight}, questions: ${skill.questionCount})`);
        });
        
        return enhancedSkills;
    } catch (error) {
        console.error('Erreur lors de la récupération des compétences:', error);
        return [];
    }
}

/**
 * Analyse les types de questions disponibles et leur répartition
 * @param {Array} questions - Les questions disponibles
 * @returns {Object} - Statistiques sur les types de questions
 */
function analyzeQuestionTypes(questions) {
    const types = {};
    
    questions.forEach(question => {
        // Vérifier que question_data existe avant d'y accéder
        const questionData = question.question_data || {};
        const questionType = questionData.type || 'unknown';
        
        if (!types[questionType]) {
            types[questionType] = {
                count: 0,
                totalPoints: 0,
                questions: []
            };
        }
        
        types[questionType].count++;
        types[questionType].totalPoints += question.points;
        types[questionType].questions.push(question);
    });
    
    return types;
}

/**
 * Sélectionne un ensemble équilibré de questions pour le sujet
 * @param {Array} questions - Toutes les questions disponibles
 * @param {Array} skills - Les compétences du test
 * @param {Object} questionTypes - Les types de questions disponibles
 * @param {Number} maxPoints - Le nombre maximum de points
 * @param {Number} maxDuration - La durée maximale en secondes
 * @returns {Array} - Les questions sélectionnées
 */
function selectBalancedQuestions(questions, skills, questionTypes, maxPoints, maxDuration) {
    console.log(`Démarrage de la sélection avec ${questions.length} questions, ${skills.length} compétences, maxPoints=${maxPoints}, maxDuration=${maxDuration}`);
    
    // Vérifier que nous avons des questions avec des compétences
    if (!questions || questions.length === 0) {
        console.error("Aucune question disponible pour la sélection.");
        return [];
    }
    
    // Vérifier que les questions ont des compétences
    const questionsWithSkills = questions.filter(q => q.skills && q.skills.length > 0);
    if (questionsWithSkills.length === 0) {
        console.error("Aucune question avec des compétences n'est disponible pour la sélection.");
        return [];
    }
    
    // Si aucune compétence n'est fournie, extraire les compétences des questions
    if (!skills || skills.length === 0) {
        console.warn("Aucune compétence n'a été fournie. Extraction des compétences à partir des questions...");
        const extractedSkills = new Set();
        questionsWithSkills.forEach(q => {
            (q.skills || []).forEach(s => {
                if (s && s.skill_id) {
                    extractedSkills.add(s);
                }
            });
        });
        skills = Array.from(extractedSkills);
        console.log(`${skills.length} compétences extraites des questions.`);
    }
    
    // La durée est déjà en secondes, correspondant au format de la base de données
    const maxDurationSeconds = maxDuration;
    
    // Récupérer le test_id des compétences pour vérification
    const testId = skills.length > 0 ? skills[0].test_id : null;
    
    // Initialiser les statistiques pour le suivi de la sélection
    const stats = {
        selectedQuestions: [],
        currentPoints: 0,
        currentDuration: 0,
        skillCoverage: {},
        typeCoverage: {},
        // Ajouter un suivi des compétences déjà couvertes
        coveredSkills: new Set()
    };
    
    // Initialiser le suivi des compétences
    if (skills && Array.isArray(skills)) {
        skills.forEach(skill => {
            if (skill && skill.skill_id) {
                stats.skillCoverage[skill.skill_id] = 0;
            }
        });
    }
    
    // Initialiser le suivi des types de questions
    if (questionTypes && typeof questionTypes === 'object') {
        Object.keys(questionTypes).forEach(type => {
            if (type) {
                stats.typeCoverage[type] = 0;
            }
        });
    }
    
    // Vérifier que questions est un tableau valide
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error('Aucune question valide pour la sélection');
        return [];
    }
    
    // Triez les questions par poids (calculé dynamiquement)
    console.log('Calcul du poids initial des questions');
    let questionsWithWeight = [];
    try {
        questionsWithWeight = questions.map(question => {
            if (!question) return null;
            
            let weight;
            try {
                weight = calculateQuestionWeight(question, stats, skills, questionTypes);
            } catch (error) {
                console.error(`Erreur lors du calcul du poids pour la question ${question.question_id}:`, error);
                weight = 1.0; // Valeur par défaut en cas d'erreur
            }
            
            return {
                question,
                weight
            };
        }).filter(item => item !== null);
    } catch (error) {
        console.error('Erreur lors du calcul des poids des questions:', error);
        return [];
    }
    
    // Processus de sélection itératif
    let remainingQuestions = [...questionsWithWeight];
    let iteration = 0;
    const maxIterations = questions.length * 2; // Éviter les boucles infinies
    
    console.log('Démarrage du processus de sélection itératif');
    
    // Continuer tant qu'il y a des questions disponibles et que les objectifs ne sont pas atteints
    while (remainingQuestions.length > 0 && 
           iteration < maxIterations && 
           stats.currentPoints < maxPoints && 
           stats.currentDuration < maxDurationSeconds) {
        
        iteration++;
        console.log(`Itération ${iteration}, ${remainingQuestions.length} questions restantes`);
        
        // Recalculer les poids des questions restantes en fonction de la sélection actuelle
        remainingQuestions.forEach(item => {
            try {
                item.weight = calculateQuestionWeight(item.question, stats, skills, questionTypes);
            } catch (error) {
                console.error(`Erreur lors du recalcul du poids pour la question ${item.question.question_id}:`, error);
                // Garder le poids précédent en cas d'erreur
            }
        });
        
        // Trier les questions par poids décroissant
        remainingQuestions.sort((a, b) => b.weight - a.weight);
        
        // Sélectionner la question avec le poids le plus élevé
        const selectedItem = remainingQuestions.shift();
        const selectedQuestion = selectedItem.question;
        
        // Vérifier si l'ajout de cette question ne ferait pas dépasser les limites
        const newPoints = stats.currentPoints + (selectedQuestion.points || 0);
        const newDuration = stats.currentDuration + (selectedQuestion.duration || 0);
        
        if (newPoints <= maxPoints && newDuration <= maxDurationSeconds) {
            // Mettre à jour les statistiques
            stats.selectedQuestions.push(selectedQuestion);
            stats.currentPoints = newPoints;
            stats.currentDuration = newDuration;
            
            // Mettre à jour la couverture des compétences et des types
            updateCoverageStats(selectedQuestion, stats);
        } else {
            // Si cette question ferait dépasser les limites, la remettre dans la liste pour une éventuelle sélection ultérieure
            // mais avec un poids réduit pour diminuer ses chances d'être sélectionnée à nouveau
            selectedItem.weight = selectedItem.weight * 0.5;
            remainingQuestions.push(selectedItem);
            // Trier à nouveau pour maintenir l'ordre par poids
            remainingQuestions.sort((a, b) => b.weight - a.weight);
            
            console.log(`Question ${selectedQuestion.question_id} rejetée: dépasserait les limites (points: ${newPoints}/${maxPoints}, durée: ${newDuration}/${maxDurationSeconds})`);
        }
        
        // Vérifier si la sélection a atteint 95% des objectifs de points ET de durée
        // Si oui, prioritiser les questions complémentaires pour les compétences non couvertes
        if (stats.currentPoints >= maxPoints * 0.95 && stats.currentDuration >= maxDurationSeconds * 0.95) {
            console.log(`Les objectifs principaux sont presque atteints. Priorité aux compétences non couvertes.`);
            
            // Identifier les compétences non couvertes
            const uncoveredSkillIds = Object.keys(stats.skillCoverage)
                .filter(skillId => stats.skillCoverage[skillId] === 0)
                .map(skillId => parseInt(skillId, 10));
            
            if (uncoveredSkillIds.length > 0) {
                // Filtrer pour ne garder que les questions qui couvrent des compétences non couvertes
                remainingQuestions = remainingQuestions.filter(item => {
                    const questionSkills = item.question.skills || [];
                    return questionSkills.some(skill => uncoveredSkillIds.includes(skill.skill_id));
                });
                
                console.log(`Recentrage sur ${remainingQuestions.length} questions couvrant des compétences manquantes`);
            }
        }
        
        console.log(`Question ${selectedQuestion.question_id} ajoutée. Total: ${stats.selectedQuestions.length} questions, ${stats.currentPoints}/${maxPoints} points, ${stats.currentDuration}/${maxDurationSeconds} sec`);
    }
    
    console.log(`Sélection terminée: ${stats.selectedQuestions.length} questions, ${stats.currentPoints}/${maxPoints} points, ${stats.currentDuration}/${maxDurationSeconds} sec`);
    
    // Retourner les objets Question directement, pas les objets {question, weight}
    return stats.selectedQuestions;
}

/**
 * Calcule le poids d'une question en fonction de différents facteurs
 * @param {Object} question - La question à évaluer
 * @param {Object} stats - Les statistiques actuelles de la sélection
 * @param {Array} skills - Liste des compétences disponibles 
 * @param {Object} questionTypes - Types de questions disponibles
 * @returns {Number} - Le poids calculé de la question
 */
function calculateQuestionWeight(question, stats, skills, questionTypes) {
    // Validation des entrées
    if (!question) {
        console.error('Question invalide dans calculateQuestionWeight');
        return 0;
    }
    
    if (!stats || typeof stats !== 'object') {
        console.error('Stats invalides dans calculateQuestionWeight');
        return 0;
    }
    
    let weight = 1.0;
    
    // Factor 1: Compétences peu représentées
    try {
        // Vérifier si question.skills est défini et est un tableau
        let questionSkills = [];
        
        if (question.skills && Array.isArray(question.skills)) {
            questionSkills = question.skills;
        } else if (question.questionSkills && Array.isArray(question.questionSkills)) {
            // Alternative si la structure est différente
            questionSkills = question.questionSkills.map(qs => qs.skill).filter(Boolean);
        }
        
        if (questionSkills.length > 0) {
            const skillWeights = questionSkills.map(skill => {
                if (!skill || !skill.skill_id) return 1;
                
                const currentCoverage = (stats.skillCoverage && typeof stats.skillCoverage === 'object') 
                    ? (stats.skillCoverage[skill.skill_id] || 0) 
                    : 0;
                    
                // Plus la compétence est sous-représentée, plus le poids est élevé
                return 1 / (currentCoverage + 1);
            });
            
            // Moyenne des poids des compétences
            if (skillWeights.length > 0) {
                const avgSkillWeight = skillWeights.reduce((sum, w) => sum + w, 0) / skillWeights.length;
                weight *= avgSkillWeight;
            }
        }
    } catch (error) {
        console.error('Erreur lors du calcul du poids des compétences:', error);
    }
    
    // Factor 2: Type de question peu représenté
    try {
        const questionData = question.question_data || {};
        const questionType = questionData.type || 'unknown';
        
        if (stats.typeCoverage && typeof stats.typeCoverage === 'object') {
            const typeCoverage = stats.typeCoverage[questionType] || 0;
            const typeWeight = 1 / (typeCoverage + 1);
            weight *= typeWeight;
        }
    } catch (error) {
        console.error('Erreur lors du calcul du poids du type de question:', error);
    }
    
    // Factor 3: Rapport points/durée (efficacité)
    try {
        const points = Number(question.points) || 0;
        const duration = Number(question.duration) || 1;
        const pointsPerSecond = points / Math.max(1, duration);
        weight *= (1 + pointsPerSecond);
    } catch (error) {
        console.error('Erreur lors du calcul du rapport points/durée:', error);
    }
    
    // Factor 4: Pénalité si ajouter cette question nous rapproche trop de la limite
    try {
        const currentPoints = Number(stats.currentPoints) || 0;
        const maxPoints = Number(stats.maxPoints) || Number.MAX_SAFE_INTEGER;
        const currentDuration = Number(stats.currentDuration) || 0;
        const maxDurationSeconds = Number(stats.maxDurationSeconds) || Number.MAX_SAFE_INTEGER;
        
        const points = Number(question.points) || 0;
        const duration = Number(question.duration) || 0;
        
        // Vérifier si l'ajout de cette question dépasserait les limites
        const wouldExceedPoints = (currentPoints + points) > maxPoints;
        const wouldExceedDuration = (currentDuration + duration) > maxDurationSeconds;
        
        // Si la question ferait dépasser l'une des limites, la pénaliser fortement
        if (wouldExceedPoints || wouldExceedDuration) {
            weight *= 0.1; // Pénalité forte pour les questions qui dépasseraient les limites
        } else {
            // Sinon, appliquer une pénalité progressive à mesure qu'on s'approche des limites
            const pointsRatio = (currentPoints + points) / maxPoints;
            const durationRatio = (currentDuration + duration) / maxDurationSeconds;
            
            // Plus on s'approche des limites, plus la pénalité est forte
            if (pointsRatio > 0.9 || durationRatio > 0.9) {
                weight *= 0.5;
            } else if (pointsRatio > 0.8 || durationRatio > 0.8) {
                weight *= 0.7;
            } else if (pointsRatio > 0.7 || durationRatio > 0.7) {
                weight *= 0.9;
            }
        }
    } catch (error) {
        console.error('Erreur lors du calcul de la pénalité de proximité des limites:', error);
    }
    
    return weight;
}

/**
 * Met à jour les statistiques de couverture après sélection d'une question
 * @param {Object} question - La question sélectionnée
 * @param {Object} stats - Les statistiques à mettre à jour
 */
function updateCoverageStats(question, stats) {
    // S'assurer que stats existe et est un objet
    if (!stats || typeof stats !== 'object') {
        console.error('Stats invalides dans updateCoverageStats');
        return;
    }
    
    // Mettre à jour la couverture des compétences
    try {
        // Vérifier si question.skills est défini et est un tableau
        let questionSkills = [];
        
        if (question.skills && Array.isArray(question.skills)) {
            questionSkills = question.skills;
        } else if (question.questionSkills && Array.isArray(question.questionSkills)) {
            // Alternative si la structure est différente
            questionSkills = question.questionSkills.map(qs => qs.skill).filter(Boolean);
        }
        
        if (questionSkills.length > 0 && stats.skillCoverage) {
            questionSkills.forEach(skill => {
                if (skill && skill.skill_id && stats.skillCoverage[skill.skill_id] !== undefined) {
                    stats.skillCoverage[skill.skill_id]++;
                }
            });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la couverture des compétences:', error);
    }
    
    // Mettre à jour la couverture des types de questions
    if (stats.typeCoverage) {
        const questionData = question.question_data || {};
        const questionType = questionData.type || 'unknown';
        if (stats.typeCoverage[questionType] !== undefined) {
            stats.typeCoverage[questionType]++;
        }
    }
}

/**
 * Crée un nouveau sujet dans la base de données
 * @param {Object} examData - Les données du sujet
 * @param {Array} selectedQuestions - Les questions sélectionnées
 * @param {Object} options - Options additionnelles
 * @param {Object} options.transaction - Transaction Sequelize optionnelle
 * @returns {Object} - Le sujet créé
 */
async function createSubject(examData, selectedQuestions, options = {}) {
    // Vérifier les données d'entrée
    if (!examData || typeof examData !== 'object') {
        throw new Error('Données d\'examen invalides');
    }
    
    if (!selectedQuestions || !Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
        throw new Error('Aucune question sélectionnée pour le sujet');
    }
    
    console.log(`Création du sujet: ${examData.title} avec ${selectedQuestions.length} questions`);
    
    // S'assurer que les données requises sont présentes
    const title = String(examData.title || '').trim();
    if (!title) {
        throw new Error('Le titre du sujet est requis');
    }
    
    const test_id = parseInt(examData.test_id, 10);
    if (isNaN(test_id) || test_id <= 0) {
        throw new Error('ID de test invalide');
    }
    
    // Vérifier que les questions ont des IDs valides
    const invalidQuestions = selectedQuestions.filter(q => !q || !q.question_id || isNaN(q.question_id));
    if (invalidQuestions.length > 0) {
        console.error(`${invalidQuestions.length} questions invalides détectées`);
        // Filtrer pour ne garder que les questions valides
        selectedQuestions = selectedQuestions.filter(q => q && q.question_id && !isNaN(q.question_id));
        
        if (selectedQuestions.length === 0) {
            throw new Error('Aucune question valide pour le sujet');
        }
    }
    
    const transaction = options.transaction || await sequelize.transaction();
    const shouldCommitTransaction = !options.transaction; // Commit seulement si on a créé la transaction ici
    
    try {
        // Créer le sujet
        const subject = await models.Subject.create({
            title: title,
            description: String(examData.description || ''),
            test_id: test_id,
            level_id: examData.level_id ? parseInt(examData.level_id, 10) : null
        }, { transaction });
        
        console.log(`Sujet créé avec l'ID: ${subject.subject_id}`);
        
        // Ajouter les questions au sujet
        const subjectQuestions = selectedQuestions.map(question => ({
            subject_id: subject.subject_id,
            question_id: question.question_id
        }));
        
        console.log(`Association de ${subjectQuestions.length} questions au sujet ${subject.subject_id}`);
        await models.SubjectHasQuestion.bulkCreate(subjectQuestions, { transaction });
        
        // Si nous avons créé notre propre transaction, nous la validons ici
        if (shouldCommitTransaction) {
            await transaction.commit();
            console.log('Transaction validée avec succès (createSubject)');
        }
        
        // Au lieu de refaire une requête, construisons directement l'objet complet
        // avec les données que nous avons déjà
        console.log(`Construction de l'objet sujet complet avec ses ${selectedQuestions.length} questions`);
        
        // Cloner l'objet sujet pour éviter de modifier l'original
        const completeSubject = {
            ...subject.toJSON(), // Convertir l'instance Sequelize en objet simple
            questions: selectedQuestions // Ajouter directement les questions déjà sélectionnées
        };
        
        console.log(`Sujet ${completeSubject.subject_id} prêt avec ${completeSubject.questions.length} questions`);
        return completeSubject;
    } catch (error) {
        // Si nous avons créé notre propre transaction, nous l'annulons en cas d'erreur
        if (shouldCommitTransaction) {
            await transaction.rollback();
            console.log('Transaction annulée suite à une erreur (createSubject)');
        }
        console.error('Erreur lors de la création du sujet:', error);
        throw error;
    }
}

module.exports = {
    generateExamSubject
}; 