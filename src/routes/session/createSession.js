const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const {  isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/sessions/',isAuthorized, async (req,res) => {
        try{
            const Session = await models['Session'].create(req.body);
            const message = `Session id : ${Session.session_id} has been created.`;
            res.json({message, data:Session})
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
