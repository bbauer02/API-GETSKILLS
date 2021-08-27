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

            parameters.include = [{
                model: models['sessionUser'],
                where: {},
                include: [{
                    model: models['sessionUserOption']
                }
                ]
            }];

            const session = await models['Session'].findOne(parameters);
            const message = 'session found';
            res.json({ message, data: session });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() })
        }
    });
}
