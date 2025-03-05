const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { Op } = require('sequelize');

module.exports = (app) => {
    app.post('/api/questions', isAuthenticated, async (req, res) => {
        try {
            // Récupérer les informations de l'utilisateur depuis le token JWT
            const userId = req.accessToken.user_id;
            const userInstituts = req.accessToken.instituts || [];
            const systemRole = req.accessToken.systemRole;
            
            console.log(`DEBUG - createQuestion - User ID: ${userId}`);
            console.log(`DEBUG - createQuestion - System Role: ${systemRole ? systemRole.power : 'non défini'}`);
            
            // Vérifier si l'utilisateur est un administrateur système (power = 10)
            const isSystemAdmin = systemRole && systemRole.power === 10;
            console.log(`DEBUG - createQuestion - Est administrateur système: ${isSystemAdmin}`);
            
            // Extraire les IDs des instituts de l'utilisateur
            const userInstitutIds = userInstituts.map(institut => institut.institut_id);
            console.log(`DEBUG - createQuestion - Instituts de l'utilisateur: ${userInstitutIds.join(', ')}`);
            
            // Récupérer le test_id de la requête
            const testId = req.body.test_id;
            if (!testId) {
                return res.status(400).json({ message: "L'identifiant du test est requis." });
            }
            
            // Vérifier si l'utilisateur a le droit de créer une question pour ce test
            // (soit il est admin système, soit il appartient à l'institut propriétaire du test)
            if (!isSystemAdmin) {
                // Récupérer le test pour vérifier son propriétaire
                const test = await models['Test'].findOne({
                    where: { test_id: testId },
                    include: [
                        {
                            model: models['Test'],
                            as: 'parent',
                            attributes: ['test_id', 'owner_id']
                        }
                    ]
                });
                
                if (!test) {
                    return res.status(404).json({ message: "Le test spécifié n'existe pas." });
                }
                
                // Déterminer le propriétaire du test (si c'est un test enfant, on regarde le propriétaire du parent)
                let ownerId;
                if (test.parent_id && test.parent) {
                    ownerId = test.parent.owner_id;
                } else {
                    ownerId = test.owner_id;
                }
                
                console.log(`DEBUG - createQuestion - Propriétaire du test: ${ownerId}`);
                
                // Vérifier si l'utilisateur appartient à l'institut propriétaire
                if (!userInstitutIds.includes(ownerId)) {
                    return res.status(403).json({ 
                        message: "Vous n'avez pas les droits nécessaires pour créer une question pour ce test." 
                    });
                }
            }
            
            // Créer la nouvelle question
            const newQuestion = {
                label: req.body.label,
                test_id: testId,
                level_id: req.body.level_id,
                instruction: req.body.instruction,
                duration: req.body.duration,
                points: req.body.points,
                question_data: req.body.question_data
            };
            
            // Valider la structure de question_data
            if (!newQuestion.question_data || !newQuestion.question_data.type) {
                return res.status(400).json({ 
                    message: "Le champ question_data doit contenir au moins un type de question." 
                });
            }
            
            // Créer la question dans la base de données
            const question = await models['Question'].create(newQuestion);
            
            // Si des compétences (skills) sont spécifiées, les associer à la question
            if (req.body.skills && Array.isArray(req.body.skills) && req.body.skills.length > 0) {
                const questionSkillsPromises = req.body.skills.map(skillId => 
                    models['QuestionSkills'].create({
                        question_id: question.question_id,
                        skill_id: skillId
                    })
                );
                
                await Promise.all(questionSkillsPromises);
            }
            
            // Fonction récursive pour inclure les parents de parent
            const includeParentRecursive = (depth = 3) => {
                if (depth === 0) return null;
                return {
                    model: models['Skill'],
                    as: 'parent',
                    attributes: ['skill_id', 'label', 'parent_id'],
                    include: [includeParentRecursive(depth - 1)].filter(Boolean)
                };
            };
            
            // Récupérer la question créée avec toutes ses relations
            const createdQuestion = await models['Question'].findOne({
                where: { question_id: question.question_id },
                include: [
                    {
                        model: models['Test'],
                        as: 'test',
                        attributes: ['test_id', 'label', 'isInternal', 'isArchive']
                    },
                    {
                        model: models['Level'],
                        as: 'level',
                        attributes: ['level_id', 'label', 'ref', 'description']
                    },
                    {
                        model: models['QuestionSkills'],
                        as: 'questionSkills',
                        include: [{
                            model: models['Skill'],
                            as: 'skill',
                            attributes: ['skill_id', 'label', 'parent_id'],
                            include: [includeParentRecursive()]
                        }]
                    }
                ]
            });
            
            // Fonction récursive pour transformer les skills avec leurs parents
            const transformSkillWithParents = (skill) => {
                if (!skill) return null;
                
                return {
                    skill_id: skill.skill_id,
                    label: skill.label,
                    parent_id: skill.parent_id,
                    parent: skill.parent ? transformSkillWithParents(skill.parent) : null
                };
            };
            
            // Transformer la question pour avoir le même format que les routes de récupération
            const transformedQuestion = {
                ...createdQuestion.get({ plain: true }),
                skills: createdQuestion.questionSkills.map(qs => 
                    transformSkillWithParents(qs.skill)
                ),
                questionSkills: undefined
            };
            
            const message = `La question '${req.body.label}' a été créée avec succès.`;
            res.status(201).json({ message, question: transformedQuestion });
        } catch (error) {
            console.error('Erreur lors de la création de la question:', error);
            
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            
            const message = "La question n'a pas pu être créée. Veuillez réessayer ultérieurement.";
            res.status(500).json({ message, data: error.message });
        }
    });
}; 