const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/empowermentTests/:empowermentTest_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {

            const parameters = {};

            parameters.include = [{
                model: models['User'],
                attributes: { exclude: ['password'] }
            },
            {
                model: models['Test']
            }
            ];

            parameters.where = { empowermentTest_id: req.params.empowermentTest_id };

            const EmpowermentTests = await models['empowermentTests'].findOne(parameters);

            if (EmpowermentTests === null) {
                const message = `empowermentTests doesn't exist.Retry with an other empowermentTests id.`;
                return res.status(404).json({ message });
            }

            const message = `empowermentTests found`;
            res.json({ message, data: EmpowermentTests })
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error })
        }
    });
}