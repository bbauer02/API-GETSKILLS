const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
module.exports = (app) => {
    app.post('/api/users/register', async (req,res) => {
        try{
            // Création du compte utilisateur
            const User = await models['User'].create(req.body);
            const message = `User : ${User.lastname} ${User.firstname} has been created.`;
            // Inscription de l'utilisateur dans l'institut organisateur de l'épreuve
            const valuesForPostInstitutHasUser = {};
            valuesForPostInstitutHasUser.user_id = User.user_id;
            valuesForPostInstitutHasUser.institut_id = req.body.institut_id;
            valuesForPostInstitutHasUser.role_id = 1;
            const institutHasUserCreated = await models['institutHasUser'].create(valuesForPostInstitutHasUser);
            // Inscription de l'utilisateur dans la session 
            const valuesForPostSessionUser = {};
            valuesForPostSessionUser.session_id = req.body.session_id;
            valuesForPostSessionUser.user_id = User.user_id;
            valuesForPostSessionUser.hasPaid = false;
            valuesForPostSessionUser.paymentMode = 1;
            const sessionUserCreated = await models['sessionUser'].create(valuesForPostSessionUser);
            User.dataValues.sessionUser = sessionUserCreated.sessionUser_id;
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
 
