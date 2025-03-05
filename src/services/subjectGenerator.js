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
    // Valider les données d'entrée
    try {
        console.log('Données reçues pour la génération:', JSON.stringify(examData));
        validateExamData(examData);
    } catch (error) {
        console.error('Erreur de validation des données:', error);
        throw error;
    }

    // Utiliser la transaction fournie ou en créer une nouvelle
    const transaction = options.transaction || await sequelize.transaction();
    const shouldCommitTransaction = !options.transaction; // Commit seulement si on a créé la transaction ici

    try {
        // Récupérer les questions disponibles pour ce test et niveau
        console.log(`Récupération des questions pour test_id=${examData.test_id}, level_id=${examData.level_id || 'tous niveaux'}`);
        const availableQuestions = await fetchAvailableQuestions(examData.test_id, examData.level_id);
        
        console.log(`Nombre de questions disponibles: ${availableQuestions.length}`);
        if (availableQuestions.length === 0) {
            if (shouldCommitTransaction) await transaction.rollback();
            throw new Error('Aucune question disponible pour ce test et ce niveau');
        }

        // Récupérer les compétences associées au test
        console.log(`Récupération des compétences pour test_id=${examData.test_id}`);
        const testSkills = await fetchTestSkills(examData.test_id);
        console.log(`Nombre de compétences trouvées: ${testSkills.length}`);
        
        // Analyser les types de questions disponibles
        console.log('Analyse des types de questions disponibles');
        const questionTypes = analyzeQuestionTypes(availableQuestions);
        console.log('Types de questions identifiés:', Object.keys(questionTypes || {}));
        
        // Générer une sélection équilibrée de questions
        console.log('Sélection des questions avec équilibrage');
        const selectedQuestions = selectBalancedQuestions(
            availableQuestions, 
            testSkills, 
            questionTypes || {},
            examData.totalPoints,
            examData.totalDuration
        );
        console.log(`Nombre de questions sélectionnées: ${selectedQuestions ? selectedQuestions.length : 0}`);

        // Créer le sujet d'examen dans la base de données
        console.log('Création du sujet dans la base de données');
        const subject = await createSubject(examData, selectedQuestions || [], { transaction });
        
        // Si nous avons créé notre propre transaction, nous la validons ici
        if (shouldCommitTransaction) {
            await transaction.commit();
            console.log(`Transaction validée avec succès pour le sujet ${subject.subject_id}`);
        }
        
        // Comme le subject retourné par createSubject contient déjà les questions,
        // nous n'avons pas besoin de le récupérer à nouveau
        return subject;
    } catch (error) {
        // Si nous avons créé notre propre transaction, nous l'annulons en cas d'erreur
        if (shouldCommitTransaction) {
            await transaction.rollback();
            console.log('Transaction annulée suite à une erreur');
        }
        console.error('Erreur détaillée lors de la génération du sujet:', error);
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
 * @returns {Array} - Les questions disponibles
 */
async function fetchAvailableQuestions(testId, levelId) {
    const whereClause = { test_id: testId };
    
    // Ajouter le niveau à la clause where s'il est spécifié
    if (levelId) {
        whereClause.level_id = levelId;
    }
    
    try {
        console.log(`Recherche de questions avec test_id=${testId}${levelId ? ` et level_id=${levelId}` : ''}`);
        
        // Utiliser l'association définie dans les modèles
        const questions = await models.Question.findAll({
            where: whereClause,
            include: [
                {
                    model: models.Skill,
                    as: 'skills',
                    through: { attributes: [] } // Ne pas inclure les attributs de la table de jointure
                }
            ]
        });
        
        console.log(`${questions.length} questions trouvées avec leurs compétences associées`);
        return questions;
    } catch (error) {
        console.error('Erreur lors de la récupération des questions:', error);
        
        // En cas d'erreur, utiliser une méthode de secours
        try {
            console.log('Tentative de récupération alternative des questions...');
            const basicQuestions = await models.Question.findAll({
                where: whereClause
            });
            
            console.log(`Récupération alternative: ${basicQuestions.length} questions trouvées (sans compétences)`);
            return basicQuestions;
        } catch (fallbackError) {
            console.error('Échec de la récupération alternative des questions:', fallbackError);
            return [];
        }
    }
}

/**
 * Récupère les compétences associées à un test
 * @param {Number} testId - L'identifiant du test
 * @returns {Array} - Les compétences du test
 */
async function fetchTestSkills(testId) {
    const skills = await models.Skill.findAll({
        where: { test_id: testId }
    });
    
    return skills;
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
 * @param {Number} maxDuration - La durée maximale en minutes
 * @returns {Array} - Les questions sélectionnées
 */
function selectBalancedQuestions(questions, skills, questionTypes, maxPoints, maxDuration) {
    console.log(`Démarrage de la sélection avec ${questions.length} questions, ${skills.length} compétences, maxPoints=${maxPoints}, maxDuration=${maxDuration}`);
    
    // Convertir la durée en secondes pour correspondre au format de la base de données
    const maxDurationSeconds = maxDuration * 60;
    
    // Initialiser les statistiques pour le suivi de la sélection
    const stats = {
        selectedQuestions: [],
        currentPoints: 0,
        currentDuration: 0,
        skillCoverage: {},
        typeCoverage: {},
        // Stocker ces valeurs pour y faire référence plus tard
        maxPoints: maxPoints,
        maxDurationSeconds: maxDurationSeconds
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
    let canAddMore = true;
    let iterationCount = 0;
    const MAX_ITERATIONS = 100; // Limiter le nombre d'itérations pour éviter une boucle infinie
    
    console.log('Démarrage du processus de sélection itératif');
    while (canAddMore && remainingQuestions.length > 0 && iterationCount < MAX_ITERATIONS) {
        iterationCount++;
        console.log(`Itération ${iterationCount}, ${remainingQuestions.length} questions restantes`);
        
        // Recalculer les poids pour les questions restantes
        try {
            remainingQuestions.forEach(item => {
                if (item && item.question) {
                    item.weight = calculateQuestionWeight(item.question, stats, skills, questionTypes);
                }
            });
        } catch (error) {
            console.error(`Erreur lors du recalcul des poids à l'itération ${iterationCount}:`, error);
            break;
        }
        
        // Trier par poids décroissant
        remainingQuestions.sort((a, b) => (b.weight || 0) - (a.weight || 0));
        
        // Vérifier qu'il reste des questions
        if (remainingQuestions.length === 0 || !remainingQuestions[0]) {
            console.log('Plus de questions disponibles');
            canAddMore = false;
            continue;
        }
        
        // Sélectionner la question avec le poids le plus élevé
        const topCandidate = remainingQuestions[0];
        
        if (!topCandidate || !topCandidate.question) {
            console.error('Candidat invalide sélectionné');
            remainingQuestions.shift(); // Retirer le candidat invalide
            continue;
        }
        
        // Vérifier si l'ajout de cette question respecte les contraintes
        if (stats.currentPoints + topCandidate.question.points <= maxPoints && 
            stats.currentDuration + topCandidate.question.duration <= maxDurationSeconds) {
            
            // Ajouter la question sélectionnée
            stats.selectedQuestions.push(topCandidate.question);
            stats.currentPoints += topCandidate.question.points;
            stats.currentDuration += topCandidate.question.duration;
            
            console.log(`Question ${topCandidate.question.question_id} ajoutée. Total: ${stats.selectedQuestions.length} questions, ${stats.currentPoints}/${maxPoints} points, ${stats.currentDuration}/${maxDurationSeconds} sec`);
            
            // Mettre à jour les statistiques de couverture
            try {
                updateCoverageStats(topCandidate.question, stats);
            } catch (error) {
                console.error(`Erreur lors de la mise à jour des statistiques pour la question ${topCandidate.question.question_id}:`, error);
            }
            
            // Retirer la question des candidats
            remainingQuestions = remainingQuestions.filter(item => 
                item && item.question && topCandidate.question && 
                item.question.question_id !== topCandidate.question.question_id
            );
        } else {
            console.log(`Question ${topCandidate.question.question_id} rejetée: dépasse les limites`);
            // Retirer cette question des candidats puisqu'elle dépasse les limites
            remainingQuestions.shift();
            
            // Vérifier si d'autres questions peuvent être ajoutées
            if (remainingQuestions.length === 0 || 
                remainingQuestions.every(item => 
                    !item || !item.question || 
                    stats.currentPoints + item.question.points > maxPoints || 
                    stats.currentDuration + item.question.duration > maxDurationSeconds
                )) {
                console.log('Plus aucune question ne peut être ajoutée sans dépasser les limites');
                canAddMore = false;
            }
        }
    }
    
    console.log(`Sélection terminée: ${stats.selectedQuestions.length} questions, ${stats.currentPoints}/${maxPoints} points, ${stats.currentDuration}/${maxDurationSeconds} sec`);
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
        
        const pointsLimit = (currentPoints + points) >= maxPoints * 0.95;
        const durationLimit = (currentDuration + duration) >= maxDurationSeconds * 0.95;
        
        if (pointsLimit || durationLimit) {
            weight *= 0.5; // Réduire le poids si on s'approche des limites
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