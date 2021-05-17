const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const {  isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/sessions/users', isAuthorized, async (req,res) => {
        try{
            const sessionUser = await models['sessionUser'].create(req.body);
            const message = `User id: ${sessionUser.user_id} has been add in the session id : ${sessionUser.session_id}.`;
            res.json({message, data:sessionUser})
        }catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()});
        }    
    });
}
