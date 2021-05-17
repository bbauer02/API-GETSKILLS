const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const {  isAuthorized} = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/sessions/:session_id/users/:user_id',isAuthorized, async (req, res) => {
        try {
            const sessionUser = await models['sessionUser'].findOne({
                where: {
                    session_id: req.params.session_id,
                    user_id: req.params.user_id
                }
            });
            if(sessionUser === null) {
                const message = `The user doesn't exist in the session.`;
                return res.status(404).json({message});
            }
            delete req.body.session_id;
            delete req.body.user_id;

            sessionUser.update(req.body,{
                where: {
                    session_id: req.params.session_id,
                    user_id: req.params.user_id
                }
            });
            const message = `The user's session has been updated `;
            res.json({message, data: sessionUser});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}