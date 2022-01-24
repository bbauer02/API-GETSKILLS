const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.post('/api/users/',isAuthenticated, isAuthorized, async (req,res) => {
        try{
            const User = await models['User'].create(req.body);
            const message = `User : ${User.lastname} ${User.firstname} has been created.`;
            res.json({message, data:User})
        }catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }    
    });
} 
