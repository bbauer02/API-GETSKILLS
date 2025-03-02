const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/questions/:question_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            // Fonction récursive pour inclure les parents de parent
            const includeParentRecursive = (depth = 3) => { // Limite la profondeur à 3 par défaut
                if (depth === 0) return null;
                return {
                    model: models['Skill'],
                    as: 'parent',
                    attributes: ['skill_id', 'label', 'parent_id'],
                    include: [includeParentRecursive(depth - 1)].filter(Boolean)
                };
            };

            const parameters = {
                where: { question_id: req.params.question_id },
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
            };

            const question = await models['Question'].findOne(parameters);
            
            if (!question) {
                const message = `Question doesn't exist. Retry with another Question id.`;
                return res.status(404).json({ message });
            }

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

            const transformedQuestion = {
                ...question.get({ plain: true }),
                skills: question.questionSkills.map(qs => 
                    transformSkillWithParents(qs.skill)
                ),
                questionSkills: undefined
            };

            const message = 'Question found';
            res.json({ message, question: transformedQuestion });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() });
        }
    });
};