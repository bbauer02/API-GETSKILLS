const sequelize = require("../../db/sequelize");
const {Op} = require("sequelize");
const {models} = require('../../models');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.delete('/api/skills/:skill_id/level/:level_id',isAuthenticated, isAuthorized, async (req, res) => {

        const levelId = req.params.level_id;
        const skillId = req.params.skill_id;

        try {
            const skill = await models['Skill'].findByPk(skillId);

            if (skill === null) {
                const message = `Skill doesn't exist. Retry with an other skill id.`;
                return res.status(404).json({message});
            }

            switch (levelId) {
                case 1:
                    // on récupère tous les petits enfant d'un parent.
                    let skillsChildChild = await models['Skill'].findAll({
                        include: [
                            {
                                model: models['Skill'],
                                required: true,
                                as: "parent",
                                include: [
                                    {
                                        model: models['Skill'],
                                        as: "parent",
                                        where: {skill_id: skillId}
                                    }]
                            },
                        ]
                    });

                    skillsChildChild.forEach((sk) => {
                        sk.destroy();
                    })

                case 2:
                    await skill.destroy({
                        where: {parent_id: skill.skill_id},
                        individualHooks: true,
                    });

                case 3:
                    console.log('case 3');
                    await skill.destroy({
                        where: {skill_id: skill.skill_id},
                        individualHooks: true,
                    });

                default:
                    const message = "Warning. Select 1,2 or 3. Level 1 for skills - 2 for child skills - 3 for child child skills."

            }

            const message = `Skills has been deleted`;
            res.json({message, data: {}});
        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.message})
        }

    });
}
 