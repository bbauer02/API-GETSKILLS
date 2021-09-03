const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/tests/:test_id/csvitems/:csvItem_id',
   isAuthenticated, isAuthorized, async (req, res) => {

    try {

      const csvItemFound = await models['csvItem'].findOne({
        where: {
          csvItem_id: req.params.csvItem_id
        }
      });

      if (csvItemFound === null) {
        const message = `csvItem doesn't exist. Retry with an other csvItem id.`;
        return res.status(404).json({ message });
      }

      const csvItemDelete = csvItemFound;
      await csvItemFound.destroy({ where: { 
        csvItem_id: req.params.csvItem_id
      } });

      const message = `csvItem id:${csvItemDelete.csvItem_id} has been deleted`;
      res.json({ message, data: csvItemDelete });
    }

    catch (error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({ message, data: error })
    }

  });
}
