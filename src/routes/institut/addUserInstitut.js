const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/users', isAuthenticated, isAuthorized, async (req,res) => {
        try{
            const institutHasUser = await models['institutHasUser'].create(req.body);
            const message = `User id: ${institutHasUser.user_id} has been add in the institut id : ${institutHasUser.institut_id}.`;
            res.json({message, data:institutHasUser})
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
