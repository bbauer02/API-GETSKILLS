const { models } = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/users', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const parameters = {};
            parameters.where = {
                session_id: req.params.session_id
            };

            parameters.include = [
                {
                    model: models['Session']
                },
                {
                    model: models['sessionUserOption']
                },
                {
                    model: models['User']
                },
                {
                    model: models['sessionExamHasExaminator']
                }
            ];

            const session = await models['sessionUser'].findAll(parameters);
            const message = 'session found';
            res.json({ message, data: session });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() })
        }
    });
}
