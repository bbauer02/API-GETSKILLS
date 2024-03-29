﻿const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/instituts/:institut_id', isAuthenticated, isAuthorized, async (req, res) => {
    try {
      const Institut = await models['Institut'].findByPk(req.params.institut_id);
      if (Institut === null) {
        const message = `Institut doesn't exist.Retry with an other institut id.`;
        return res.status(404).json({ message });
      }
      const institutDeleted = Institut;
      await Institut.destroy({ where: { institut_id: Institut.institut_id } });
      const message = `Institut id:${institutDeleted.institut_id} has been deleted`;
      res.json({ message, institut: institutDeleted });
    }
    catch (error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({ message, data: error })
    }
  });
}
