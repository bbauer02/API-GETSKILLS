const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/',isAuthenticated, isAuthorized, async (req,res) => {
        try{
            const Institut = await models['Institut'].create(req.body);
            const message = `Institut : ${Institut.label} has been created.`;
            res.json({message, data:Institut})
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
