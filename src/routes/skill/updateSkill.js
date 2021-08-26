const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/skills/:skill_id', isAuthenticated, isAuthorized, async (req, res) => {

        const skillId = req.params.skill_id;

        try {
            const Skill = await models['Skill'].findByPk(skillId);
            if(Skill === null) {
                const message = `Skill doesn't exist. Retry with an other Skill id.`;
                return res.status(404).json({message});
            }
            await Skill.update(req.body, {
                where:{skill_id:skillId}
            });
            const message = `Skill id:${Skill.skill_id} has been updated `;
            res.json({message, data: Skill});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}