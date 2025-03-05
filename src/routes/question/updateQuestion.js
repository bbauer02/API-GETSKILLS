const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { Op } = require('sequelize');

module.exports = (app) => {
    app.put('/api/questions/:question_id', isAuthenticated, async (req, res) => {
        try {
            const questionId = parseInt(req.params.question_id);
            if (isNaN(questionId)) {
                return res.status(400).json({ message: "L'identifiant de la question doit être un nombre." });
            }
            
            // Récupérer les informations de l'utilisateur depuis le token JWT
            const userId = req.accessToken.user_id;
            const userInstituts = req.accessToken.instituts || [];
            const systemRole = req.accessToken.systemRole;
            
            console.log(`DEBUG - updateQuestion - User ID: ${userId}`);
            console.log(`DEBUG - updateQuestion - System Role: ${systemRole ? systemRole.power : 'non défini'}`);
            
            // Vérifier si l'utilisateur est un administrateur système (power = 10)
            const isSystemAdmin = systemRole && systemRole.power === 10;
            console.log(`DEBUG - updateQuestion - Est administrateur système: ${isSystemAdmin}`);
            
            // Extraire les IDs des instituts de l'utilisateur
            const userInstitutIds = userInstituts.map(institut => institut.institut_id);
            console.log(`DEBUG - updateQuestion - Instituts de l'utilisateur: ${userInstitutIds.join(', ')}`);
            
            // Récupérer la question existante avec son test associé
            const question = await models['Question'].findOne({
                where: { question_id: questionId },
                include: [
                    {
                        model: models['Test'],
                        as: 'test',
                        include: [
                            {
                                model: models['Test'],
                                as: 'parent',
                                attributes: ['test_id', 'owner_id']
                            }
                        ]
                    }
                ]
            });
            
            if (!question) {
                return res.status(404).json({ message: "La question spécifiée n'existe pas." });
            }
            
            // Vérifier si l'utilisateur a le droit de modifier cette question
            if (!isSystemAdmin) {
                // Déterminer le propriétaire du test (si c'est un test enfant, on regarde le propriétaire du parent)
                let ownerId;
                if (question.test.parent_id && question.test.parent) {
                    ownerId = question.test.parent.owner_id;
                } else {
                    ownerId = question.test.owner_id;
                }
                
                console.log(`DEBUG - updateQuestion - Propriétaire du test: ${ownerId}`);
                
                // Vérifier si l'utilisateur appartient à l'institut propriétaire
                if (!userInstitutIds.includes(ownerId)) {
                    return res.status(403).json({ 
                        message: "Vous n'avez pas les droits nécessaires pour modifier cette question." 
                    });
                }
            }
            
            // Si le test_id est modifié, vérifier que l'utilisateur a le droit de déplacer la question vers ce test
            if (req.body.test_id && req.body.test_id !== question.test_id) {
                if (!isSystemAdmin) {
                    // Récupérer le nouveau test pour vérifier son propriétaire
                    const newTest = await models['Test'].findOne({
                        where: { test_id: req.body.test_id },
                        include: [
                            {
                                model: models['Test'],
                                as: 'parent',
                                attributes: ['test_id', 'owner_id']
                            }
                        ]
                    });
                    
                    if (!newTest) {
                        return res.status(404).json({ message: "Le nouveau test spécifié n'existe pas." });
                    }
                    
                    // Déterminer le propriétaire du nouveau test
                    let newOwnerId;
                    if (newTest.parent_id && newTest.parent) {
                        newOwnerId = newTest.parent.owner_id;
                    } else {
                        newOwnerId = newTest.owner_id;
                    }
                    
                    console.log(`DEBUG - updateQuestion - Propriétaire du nouveau test: ${newOwnerId}`);
                    
                    // Vérifier si l'utilisateur appartient à l'institut propriétaire du nouveau test
                    if (!userInstitutIds.includes(newOwnerId)) {
                        return res.status(403).json({ 
                            message: "Vous n'avez pas les droits nécessaires pour déplacer cette question vers le test spécifié." 
                        });
                    }
                }
            }
            
            // Préparer les données à mettre à jour
            const updatedData = {
                label: req.body.label !== undefined ? req.body.label : question.label,
                test_id: req.body.test_id !== undefined ? req.body.test_id : question.test_id,
                level_id: req.body.level_id !== undefined ? req.body.level_id : question.level_id,
                instruction: req.body.instruction !== undefined ? req.body.instruction : question.instruction,
                duration: req.body.duration !== undefined ? req.body.duration : question.duration,
                points: req.body.points !== undefined ? req.body.points : question.points,
                question_data: req.body.question_data !== undefined ? req.body.question_data : question.question_data
            };
            
            // Valider la structure de question_data si elle est modifiée
            if (req.body.question_data && (!updatedData.question_data || !updatedData.question_data.type)) {
                return res.status(400).json({ 
                    message: "Le champ question_data doit contenir au moins un type de question." 
                });
            }
            
            // Mettre à jour la question dans la base de données
            await question.update(updatedData);
            
            // Si des compétences (skills) sont spécifiées, mettre à jour les associations
            if (req.body.skills && Array.isArray(req.body.skills)) {
                // Supprimer les associations existantes
                await models['QuestionSkills'].destroy({
                    where: { question_id: questionId }
                });
                
                // Créer les nouvelles associations
                if (req.body.skills.length > 0) {
                    const questionSkillsPromises = req.body.skills.map(skillId => 
                        models['QuestionSkills'].create({
                            question_id: questionId,
                            skill_id: skillId
                        })
                    );
                    
                    await Promise.all(questionSkillsPromises);
                }
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
            
            // Récupérer la question mise à jour avec toutes ses relations
            const updatedQuestion = await models['Question'].findOne({
                where: { question_id: questionId },
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
                ...updatedQuestion.get({ plain: true }),
                skills: updatedQuestion.questionSkills.map(qs => 
                    transformSkillWithParents(qs.skill)
                ),
                questionSkills: undefined
            };
            
            const message = `La question '${updatedQuestion.label}' a été mise à jour avec succès.`;
            res.json({ message, question: transformedQuestion });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la question:', error);
            
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            
            const message = "La question n'a pas pu être mise à jour. Veuillez réessayer ultérieurement.";
            res.status(500).json({ message, data: error.message });
        }
    });
}; 