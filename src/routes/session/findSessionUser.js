const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/sessions/:session_id/users/:user_id', isAuthenticated,isAuthorized, async (req, res) => {
        try {
            const parameters = {}; 
            parameters.where = {
                session_id: req.params.session_id,
                user_id: req.params.user_id
            };

            parameters.include = [{
                model: models['sessionUserOption'],
                where: {}
            }];

            const sessionUser = await models['sessionUser'].findOne(parameters);
            const message = 'sessionUser found';
            res.json({message, data: sessionUser});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}