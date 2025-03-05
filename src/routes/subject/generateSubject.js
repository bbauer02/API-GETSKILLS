/**
 * Route pour la génération automatique de sujets d'examen
 * Cette route prend en compte les contraintes de points, durée, compétences et types de questions
 * pour générer un sujet équilibré.
 */
const { generateExamSubject } = require('../../services/subjectGenerator');
const { authorize } = require('../../auth/permissions');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { models } = require('../../models');
const sequelize = require('../../db/sequelize');

module.exports = (app) => {
    /**
     * @route POST /api/subject/generate
     * @description Génère un nouveau sujet d'examen en équilibrant les compétences et types de questions
     * @access Privé (requiert authentification et rôle approprié)
     */
    app.post('/api/subject/generate', isAuthenticated, authorize, async (req, res) => {
        // Initialiser la transaction au niveau supérieur pour pouvoir y accéder en cas d'erreur
        let transaction;
        
        try {
            console.log('Requête reçue pour générer un sujet:', req.body);
            
            // Validation des champs obligatoires
            const requiredFields = ['title', 'test_id', 'totalDuration', 'totalPoints', 'requiredPoints'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Champs obligatoires manquants: ${missingFields.join(', ')}`,
                });
            }
            
            // Extraction et conversion des données
            const title = String(req.body.title || '').trim();
            const description = String(req.body.description || '').trim();
            const test_id = parseInt(req.body.test_id, 10);
            const level_id = req.body.level_id ? parseInt(req.body.level_id, 10) : null;
            const totalDuration = parseInt(req.body.totalDuration, 10);
            const totalPoints = parseInt(req.body.totalPoints, 10);
            const requiredPoints = parseInt(req.body.requiredPoints, 10);
            
            // Validation supplémentaire des valeurs numériques
            if (isNaN(test_id) || test_id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "L'ID du test doit être un nombre positif"
                });
            }
            
            if (isNaN(totalDuration) || totalDuration <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "La durée totale doit être un nombre positif (en minutes)"
                });
            }
            
            if (isNaN(totalPoints) || totalPoints <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Le nombre de points doit être un nombre positif"
                });
            }
            
            if (isNaN(requiredPoints) || requiredPoints < 0 || requiredPoints > totalPoints) {
                return res.status(400).json({
                    success: false,
                    message: "Le nombre de points requis doit être un nombre positif et inférieur ou égal au nombre total de points"
                });
            }
            
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: "Le titre ne peut pas être vide"
                });
            }

            // Valider que le test existe
            const testExists = await models.Test.findByPk(test_id);
            if (!testExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Le test spécifié n'existe pas" 
                });
            }

            // Valider que le niveau existe s'il est fourni
            if (level_id) {
                const levelExists = await models.Level.findByPk(level_id);
                if (!levelExists) {
                    return res.status(404).json({ 
                        success: false, 
                        message: "Le niveau spécifié n'existe pas" 
                    });
                }
            }

            // Préparation des données pour la génération
            const examData = {
                title,
                description,
                test_id,
                level_id,
                totalDuration,
                totalPoints,
                requiredPoints
            };
            
            console.log('Données validées pour la génération:', examData);
            
            // Démarrer une transaction
            transaction = await sequelize.transaction();
            
            try {
                const generatedSubject = await generateExamSubject(examData, { transaction });
                
                if (!generatedSubject) {
                    await transaction.rollback();
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la génération du sujet: aucun sujet retourné"
                    });
                }

                // Calculer les statistiques du sujet généré pour les retourner dans la réponse
                const subjectStats = {
                    questionCount: (generatedSubject.questions || []).length,
                    totalPoints: (generatedSubject.questions || []).reduce((sum, q) => sum + (parseInt(q.points || 0, 10)), 0),
                    totalDuration: (generatedSubject.questions || []).reduce((sum, q) => sum + (parseInt(q.duration || 0, 10)), 0) / 60, // Convertir en minutes
                };
                
                try {
                    subjectStats.skillsCoverage = await calculateSkillsCoverage(generatedSubject);
                } catch (error) {
                    console.error('Erreur lors du calcul de la couverture des compétences:', error);
                    subjectStats.skillsCoverage = [];
                }
                
                try {
                    subjectStats.questionTypeDistribution = calculateQuestionTypeDistribution(generatedSubject);
                } catch (error) {
                    console.error('Erreur lors du calcul de la distribution des types de questions:', error);
                    subjectStats.questionTypeDistribution = [];
                }

                // Valider la transaction
                await transaction.commit();
                console.log(`Transaction validée avec succès pour le sujet ${generatedSubject.subject_id}`);

                // Retourner la réponse avec les données du sujet généré
                return res.status(201).json({
                    success: true,
                    message: "Sujet d'examen généré avec succès",
                    subject: generatedSubject,
                    stats: subjectStats
                });

            } catch (error) {
                // En cas d'erreur, annuler la transaction si elle est toujours active
                if (transaction) {
                    try {
                        await transaction.rollback();
                        console.log('Transaction annulée suite à une erreur');
                    } catch (rollbackError) {
                        console.error("Erreur lors de l'annulation de la transaction:", rollbackError);
                    }
                }
                
                console.error("Erreur détaillée lors de la génération du sujet:", error);
                
                // Réponse d'erreur plus descriptive
                return res.status(500).json({
                    success: false,
                    message: "Une erreur est survenue lors de la génération du sujet",
                    error: error.message,
                    errorType: error.name,
                    errorStack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
                });
            }

        } catch (error) {
            // Gestion des erreurs au niveau supérieur
            if (transaction) {
                try {
                    await transaction.rollback();
                    console.log('Transaction annulée suite à une erreur au niveau supérieur');
                } catch (rollbackError) {
                    console.error("Erreur lors de l'annulation de la transaction:", rollbackError);
                }
            }
            
            console.error("Erreur générale lors de la génération du sujet:", error);
            return res.status(500).json({
                success: false,
                message: "Une erreur inattendue est survenue lors de la génération du sujet",
                error: error.message
            });
        }
    });
};

/**
 * Calcule la couverture des compétences dans le sujet généré
 * @param {Object} subject - Le sujet généré avec ses questions
 * @returns {Object} - Statistiques sur la couverture des compétences
 */
async function calculateSkillsCoverage(subject) {
    // Vérifier que subject est valide
    if (!subject || !subject.test_id) {
        console.error('Sujet invalide dans calculateSkillsCoverage - test_id manquant');
        return [];
    }
    
    if (!subject.questions || !Array.isArray(subject.questions) || subject.questions.length === 0) {
        console.error('Sujet invalide dans calculateSkillsCoverage - questions manquantes ou invalides');
        return [];
    }
    
    console.log(`Calcul de la couverture des compétences pour le sujet ${subject.subject_id} avec ${subject.questions.length} questions`);
    
    try {
        // Récupérer toutes les compétences du test
        const testSkills = await models.Skill.findAll({
            where: { test_id: subject.test_id }
        });
        
        if (!testSkills || testSkills.length === 0) {
            console.log(`Aucune compétence trouvée pour le test ${subject.test_id}`);
            return [];
        }
        
        // Initialiser la couverture
        const coverage = {};
        testSkills.forEach(skill => {
            coverage[skill.skill_id] = {
                skill_id: skill.skill_id,
                label: skill.label,
                count: 0,
                percentage: 0
            };
        });
        
        // Collecter toutes les compétences à partir des questions
        const skillPromises = subject.questions.map(async question => {
            // Vérifier si les compétences sont déjà incluses dans la question
            if (question.skills && Array.isArray(question.skills) && question.skills.length > 0) {
                return question.skills;
            } else {
                // Sinon, les récupérer de la base de données
                try {
                    const questionSkills = await models.QuestionSkills.findAll({
                        where: { question_id: question.question_id },
                        include: [{ model: models.Skill, as: 'skill' }]
                    });
                    return questionSkills.map(qs => qs.skill).filter(Boolean);
                } catch (error) {
                    console.error(`Erreur lors de la récupération des compétences pour la question ${question.question_id}:`, error);
                    return [];
                }
            }
        });
        
        // Attendre que toutes les requêtes soient terminées
        const skillsResults = await Promise.all(skillPromises);
        
        // Mettre à jour les compteurs de couverture
        skillsResults.forEach(skills => {
            if (!skills || !Array.isArray(skills)) return;
            
            skills.forEach(skill => {
                if (!skill || !skill.skill_id) return;
                
                if (coverage[skill.skill_id]) {
                    coverage[skill.skill_id].count++;
                }
            });
        });
        
        // Calculer les pourcentages
        const totalQuestions = subject.questions.length;
        Object.values(coverage).forEach(skill => {
            skill.percentage = Math.round((skill.count / totalQuestions) * 100);
        });
        
        return Object.values(coverage);
    } catch (error) {
        console.error('Erreur dans calculateSkillsCoverage:', error);
        return [];
    }
}

/**
 * Calcule la distribution des types de questions dans le sujet généré
 * @param {Object} subject - Le sujet généré avec ses questions
 * @returns {Object} - Statistiques sur les types de questions
 */
function calculateQuestionTypeDistribution(subject) {
    // Vérifier que subject et questions existent
    if (!subject) {
        console.error('Sujet invalide dans calculateQuestionTypeDistribution - sujet manquant');
        return [];
    }
    
    if (!subject.questions || !Array.isArray(subject.questions) || subject.questions.length === 0) {
        console.error('Sujet invalide dans calculateQuestionTypeDistribution - questions manquantes ou invalides');
        return [];
    }
    
    console.log(`Calcul de la distribution des types pour le sujet ${subject.subject_id} avec ${subject.questions.length} questions`);
    
    try {
        const distribution = {};
        
        // Compter les occurrences de chaque type de question
        subject.questions.forEach(question => {
            if (!question) {
                console.log('Question invalide ignorée dans calculateQuestionTypeDistribution');
                return;
            }
            
            // S'assurer que question_data existe
            const questionData = question.question_data || {};
            const questionType = questionData.type || 'unknown';
            
            if (!distribution[questionType]) {
                distribution[questionType] = {
                    type: questionType,
                    count: 0,
                    points: 0,
                    percentage: 0
                };
            }
            
            distribution[questionType].count++;
            distribution[questionType].points += parseInt(question.points || 0, 10);
        });
        
        // Calculer les pourcentages
        const totalQuestions = subject.questions.length;
        Object.values(distribution).forEach(type => {
            type.percentage = Math.round((type.count / totalQuestions) * 100);
        });
        
        return Object.values(distribution);
    } catch (error) {
        console.error('Erreur dans calculateQuestionTypeDistribution:', error);
        return [];
    }
} 