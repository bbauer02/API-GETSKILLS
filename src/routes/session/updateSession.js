const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessions/:session_id', isAuthenticated,isAuthorized, async (req, res) => {
        try {
            const Session = await models['Session'].findOne({
                where: {
                    session_id: req.params.session_id,
                    institut_id: req.params.institut_id
                }
            });
            if(Session === null) {
                const message = `Session doesn't exist.Retry with an other session id.`;
                return res.status(404).json({message});
            }
            delete req.body.institut_id;
            if (req.body.validation === false) delete req.body.validation;

            Session.update(req.body,{
                where:{session_id:req.params.session_id} 
            });
            const message = `Session id:${Session.session_id} has been updated `;
            res.json({message, data: Session});
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