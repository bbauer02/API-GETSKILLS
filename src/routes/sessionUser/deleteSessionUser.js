﻿const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/instituts/:institut_id/sessions/:session_id/users/:user_id', isAuthenticated,isAuthorized, async (req, res) => {
    try {
      const sessionUser = await models['sessionUser'].findOne({
        where: {
            session_id: req.params.session_id,
            user_id: req.params.user_id
          }
      });
      if(sessionUser === null) {
        const message = `The user is not a member of this session.`;
        return res.status(404).json({message});
      }
      const sessionUserDeleted = sessionUser;
      await sessionUser.destroy({
        where:
           {
              session_id: req.params.session_id,
              user_id: req.params.user_id
            }
      });
      const message = `The user has been deleted from the session.`;
      res.json({message, data: sessionUserDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
  