const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { Op } = require('sequelize');

module.exports = (app) => {
    app.get('/api/questions', isAuthenticated, async (req,res) => {
        try {
            const parameters = {};
            parameters.where = {};
            
            // Récupérer les informations de l'utilisateur depuis le token JWT
            const userId = req.accessToken.user_id;
            const userInstituts = req.accessToken.instituts || [];
            const systemRole = req.accessToken.systemRole;
            
            console.log(`DEBUG - findAllQuestions - User ID: ${userId}`);
            console.log(`DEBUG - findAllQuestions - System Role: ${systemRole ? systemRole.power : 'non défini'}`);
            
            // Vérifier si l'utilisateur est un administrateur système (power = 10)
            const isSystemAdmin = systemRole && systemRole.power === 10;
            console.log(`DEBUG - findAllQuestions - Est administrateur système: ${isSystemAdmin}`);
            
            // Extraire les IDs des instituts de l'utilisateur
            const userInstitutIds = userInstituts.map(institut => institut.institut_id);
            console.log(`DEBUG - findAllQuestions - Instituts de l'utilisateur: ${userInstitutIds.join(', ')}`);
            
            // Si l'utilisateur n'est pas admin système, nous devons déterminer les tests auxquels il a accès
            let accessibleTestIds = [];
            
            if (!isSystemAdmin) {
                // Récupérer tous les tests parents auxquels l'utilisateur a accès
                // (ceux dont l'institut propriétaire correspond à l'un des instituts de l'utilisateur)
                const parentTests = await models['Test'].findAll({
                    attributes: ['test_id'],
                    where: {
                        owner_id: {
                            [Op.in]: userInstitutIds
                        },
                        parent_id: {
                            [Op.is]: null
                        }
                    }
                });
                
                const parentTestIds = parentTests.map(test => test.test_id);
                console.log(`DEBUG - findAllQuestions - Tests parents accessibles: ${parentTestIds.join(', ')}`);
                
                // Récupérer tous les tests enfants des tests parents accessibles
                // IMPORTANT: Nous ne filtrons PAS par owner_id ici, car nous voulons tous les enfants
                // des tests parents accessibles, quel que soit leur propriétaire
                if (parentTestIds.length > 0) {
                    const childTests = await models['Test'].findAll({
                        attributes: ['test_id'],
                        where: {
                            parent_id: {
                                [Op.in]: parentTestIds
                            }
                        }
                    });
                    
                    const childTestIds = childTests.map(test => test.test_id);
                    console.log(`DEBUG - findAllQuestions - Tests enfants accessibles: ${childTestIds.join(', ')}`);
                    
                    // Combiner les IDs des tests parents et enfants
                    accessibleTestIds = [...parentTestIds, ...childTestIds];
                } else {
                    accessibleTestIds = parentTestIds;
                }
                
                console.log(`DEBUG - findAllQuestions - Total des tests accessibles: ${accessibleTestIds.length}`);
                
                if (accessibleTestIds.length === 0) {
                    // Si l'utilisateur n'a accès à aucun test, retourner une liste vide
                    return res.json({ message: "0 question(s) found", questions: [] });
                }
            }
            
            // filtre par test id spécifique si fourni dans la requête
            if (req.query.test) {
                const test_id = parseInt(req.query.test);
                if (isNaN(test_id)) {
                    const message = `Test parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                
                // Si un test spécifique est demandé et que l'utilisateur n'est pas admin système,
                // vérifier que ce test est dans la liste des tests accessibles
                if (!isSystemAdmin) {
                    // Vérifier si le test demandé est accessible
                    const isTestAccessible = accessibleTestIds.includes(test_id);
                    
                    if (!isTestAccessible) {
                        return res.status(403).json({ 
                            message: "Vous n'avez pas accès aux questions de ce test." 
                        });
                    }
                }
                
                parameters.where.test_id = test_id;
            } 
            // Si aucun test spécifique n'est demandé et que l'utilisateur n'est pas admin système,
            // filtrer par les tests accessibles
            else if (!isSystemAdmin) {
                parameters.where.test_id = {
                    [Op.in]: accessibleTestIds
                };
            }

            // Parameter : LIMIT
            if (req.query.limit) {
                const limit = parseInt(req.query.limit);
                if (isNaN(limit)) {
                    const message = `Limit parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.limit = limit;
            }

            // Parameter : OFFSET
            if (req.query.offset) {
                const offset = parseInt(req.query.offset);
                if (isNaN(offset)) {
                    const message = `Offset parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.offset = offset;
            }

            // Fonction récursive pour inclure les parents
            const includeParentRecursive = (depth = 3) => {
                if (depth === 0) return null;
                return {
                    model: models['Skill'],
                    as: 'parent',
                    attributes: ['skill_id', 'label', 'parent_id'],
                    include: [includeParentRecursive(depth - 1)].filter(Boolean)
                };
            };

            parameters.include = [
                {
                    model: models['Level'],
                    as: 'level',
                    attributes: ['level_id', 'label', 'ref']
                },
                {
                    model: models['Test'],
                    as: 'test',
                    attributes: ['test_id', 'label', 'parent_id'],
                    include: [
                        {
                            model: models['Institut'],
                            as: 'owner',
                            attributes: ['institut_id', 'label']
                        },
                        {
                            model: models['Test'],
                            as: 'parent',
                            attributes: ['test_id', 'label', 'owner_id'],
                            include: [{
                                model: models['Institut'],
                                as: 'owner',
                                attributes: ['institut_id', 'label']
                            }]
                        }
                    ]
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
            ];

            // Parameter : ORDER
            parameters.order = [['label', 'ASC']];

            // Parameter : attributes
            parameters.attributes = [
                'question_id',
                'test_id',
                'level_id',
                'label',
                'instruction',
                'duration',
                'points',
                'question_data'
            ];

            console.log(`DEBUG - findAllQuestions - Paramètres de recherche: ${JSON.stringify(parameters.where)}`);
            const questions = await models['Question'].findAll(parameters);
            console.log(`DEBUG - findAllQuestions - Nombre de questions trouvées: ${questions.length}`);

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

            // Transformer les questions
            const transformedQuestions = questions.map(question => {
                const plainQuestion = question.get({ plain: true });
                return {
                    ...plainQuestion,
                    skills: plainQuestion.questionSkills.map(qs => 
                        transformSkillWithParents(qs.skill)
                    ),
                    questionSkills: undefined
                };
            });

            const message = `${transformedQuestions.length} question(s) found`;
            res.json({ message, questions: transformedQuestions });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des questions:', error);
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.message })
        }
    });
}