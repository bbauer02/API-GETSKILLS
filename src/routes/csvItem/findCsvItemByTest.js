const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/tests/:test_id/csvitems',
        isAuthenticated, isAuthorized, async (req, res) => {
            try {

                const parameters = {};
                parameters.where = {
                    test_id: req.params.test_id
                };

                parameters.order = [['order', 'ASC']]

                const allCsvItemFound = await models['csvItem'].findAll(parameters);
                const message = `${allCsvItemFound.length} csvItem(s) found`;
                res.json({ message, data: allCsvItemFound });
            }
            catch (error) {
                const message = `Service not available. Please retry later.`;
                res.status(500).json({ message, data: error.toString() });
            }
        });
}