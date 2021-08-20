const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessionUsersOptions', isAuthorized, isAuthenticated, async (req,res) => {
        try{
            const sessionUserOption = await models['sessionUserOption'].create(req.body);
            const message = `Option has been added in the sessionUser id : ${sessionUserOption.sessionUser_id}.`;
            res.json({message, data:sessionUserOption})
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
