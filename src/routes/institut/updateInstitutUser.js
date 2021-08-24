const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/users/:user_id',isAuthenticated, isAuthorized,async (req, res) => {
        try {

            const roleInInstitut = req.body.roleInstitut;
            const institutHasUserForUpdate = {
                user_id: req.params.user_id,
                institut_id: req.params.institut_id,
                role_id: roleInInstitut
            }

            // Cherche utilisateur
            const User = await models['User'].findByPk(req.params.user_id);
            if (User === null) {
                const message = `User doesn't exist.Retry with an other user id.`;
                return res.status(404).json({message});
            }

            // Cherche le instutitHasUser pour trouver son rôle dans l'institut
            const InstitutHasUser = await models['institutHasUser'].findByPk(req.body.institutHasUser_id);
            if (InstitutHasUser === null) {
                const message = "InstitutHasUser doesn't exist. Retry with another institutHasUser id";
                return res.status(404).json({message});
            }

            // Met à jour l'utilisateur
            await User.update(req.body,{
                where:{user_id:req.params.user_id}
            });

            // Met à jour son rôle dans l'institut
            await InstitutHasUser.update(institutHasUserForUpdate,{
                where:{
                    user_id: req.params.user_id,
                    institut_id: req.params.institut_id
                }
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