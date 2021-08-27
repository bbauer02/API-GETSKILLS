const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/users/:user_id',isAuthenticated,isAuthorized, async (req, res) => {
        try {
            const User = await models['User'].findByPk(req.params.user_id);
            if(User === null) {
                const message = `User doesn't exist.Retry with an other user id.`;
                return res.status(404).json({message});
            }

            await User.update(req.body,{
                where:{user_id:req.params.user_id}
            });
            const message = `User id:${User.user_id} has been updated `;
            res.json({message, data: User});
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