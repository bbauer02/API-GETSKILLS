const {models} = require('../../models');
  
module.exports = (app) => {
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const User = await models['User'].findByPk(req.params.id);
      if(User === null) {
        const message = `User doesn't exist.Retry with an other User id.`;
        return res.status(404).json({message});
      }
      const UserDeleted = User;
      await User.destroy({where: { user_id: User.id}});
      const message = `User id:${UserDeleted.user_id} has been deleted`;
      res.json({message, data: UserDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
 