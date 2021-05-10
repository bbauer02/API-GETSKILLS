const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const {  isAuthorized } = require('../../auth/jwt.utils'); 

module.exports = (app) => {
    app.put('/api/instituts/:id',isAuthorized,async (req, res) => {
        try {
            const Institut = await models['Institut'].findByPk(req.params.id);
            if(Institut === null) {
                const message = `Institut doesn't exist.Retry with an other institut id.`;
                return res.status(404).json({message});
            }
            Institut.update(req.body,{
                where:{institut_id:req.params.id}
            });
            const message = `Institut id:${Institut.institut_id} has been updated `;
            res.json({message, data: Institut});
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