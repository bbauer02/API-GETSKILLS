const {models} = require('../../models');
  
module.exports = (app) => {
  app.delete('/api/sessions/:id', async (req, res) => {
    try {
      const Session = await models['Session'].findByPk(req.params.id);
      if(Session === null) {
        const message = `Session doesn't exist.Retry with an other Session id.`;
        return res.status(404).json({message});
      }
      const SessionDeleted = Session;
      await Session.destroy({where: { session_id: Session.session_id}});
      const message = `Session id:${SessionDeleted.session_id} has been deleted`;
      res.json({message, data: SessionDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
  