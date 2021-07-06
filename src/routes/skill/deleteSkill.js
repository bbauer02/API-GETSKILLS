const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
  app.delete('/api/skills/:id', async (req, res) => {
    try {
      const skill = await models['Skill'].findByPk(req.params.id);
      if(skill === null) {
        const message = `Skill doesn't exist. Retry with an other skill id.`;
        return res.status(404).json({message});
      }
      const SkillDeleted = skill;
      await skill.destroy({where: { skill_id: skill.skill_id}});
      const message = `Skill id:${SkillDeleted.skill_id} has been deleted`;
      res.json({message, data: SkillDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error.message})
    }

  });
}
 