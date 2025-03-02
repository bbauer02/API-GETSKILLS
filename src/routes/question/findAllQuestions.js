const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/questions', isAuthenticated, isAuthorized, async (req,res) => {
        try {
            const parameters = {};
            parameters.where = {};
            
            // filtre par test id
            if (req.query.test) {
                const test_id = parseInt(req.query.test);
                if (isNaN(test_id)) {
                    const message = `Level parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.where.test_id = test_id;
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
                    attributes: ['test_id', 'label']
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

            const questions = await models['Question'].findAll(parameters);

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
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.message })
        }
    });
}