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

                const allCsvItemFound = await models['csvItem'].findOne(parameters);

                if (allCsvItemFound === null) {
                    const message = `No template for this test`;
                    return res.status(200).json({ message });
                }
                const message = `CSV Item found`;
                res.json({ message, data: allCsvItemFound });
            }
            catch (error) {
                const message = `Service not available. Please retry later.`;
                res.status(500).json({ message, data: error.toString() });
            }
        });
}