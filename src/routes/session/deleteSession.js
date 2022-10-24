const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/instituts/:institut_id/sessions/:session_id', isAuthenticated,isAuthorized, async (req, res) => {
    try {
      const Session = await models['Session'].findOne({
        where: {
            session_id: req.params.session_id,
            institut_id: req.params.institut_id
          }
      });
      if(Session === null) {
        const message = `Session doesn't exist.Retry with an other Session id.`;
        return res.status(404).json({message});
      }
      const SessionDeleted = Session;
      await Session.destroy({where: { session_id: Session.session_id}});
      const message = `Session id:${SessionDeleted.session_id} has been deleted`;
      res.json({message, session: SessionDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
  