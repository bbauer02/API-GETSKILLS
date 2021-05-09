﻿const {models} = require('../../models');
const {  isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/sessions/:id',isAuthorized, async (req, res) => {
    try {
      const Session = await models['Session'].findOne({
        where: {
            session_id: req.params.id,
            institut_id: req.body.institut_id
          }
      });
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
  