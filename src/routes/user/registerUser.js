const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
module.exports = (app) => {
    app.post('/api/users/register', async (req,res) => {
        try{

            const {user,institutHasUser, sessionUser, sessionUserOptions} = req.body;
            // Création du compte utilisateur
            user.systemRole_id = 1;
            const User = await models['User'].create(user);
            // Inscription de l'utilisateur dans l'institut organisateur de l'épreuve
            institutHasUser.user_id = User.user_id;
            institutHasUser.role_id =1
            await models['institutHasUser'].create(institutHasUser);
            // Inscription de l'utilisateur dans la session
            sessionUser.user_id = User.user_id;
            sessionUser.inscription = new Date();
            const newSessionUser = await models['sessionUser'].create(sessionUser);
            // Inscription des options de l'utilisateur
           if(sessionUserOptions.length > 0) {
                const sessionUserOptionsMAJ = sessionUserOptions.map(_option => ({
                    ..._option,
                    sessionUser_id: newSessionUser.sessionUser_id
                }));
               await models['sessionUserOption'].bulkCreate(sessionUserOptionsMAJ);
            }

            // Création de la facture
            // await models['sessionUserOption']


            await models['Session'].findOne({
                where: {
                    session_id: sessionUser.session_id,
                    institut_id: institutHasUser.institut_id
                }
            })

            const invoice = {
                institut_id: institutHasUser.institut_id,
                session_id: sessionUser.session_id,
                user_id: User.user_id,
                session: `Session du ${new Date()} au ${new Date()}`,
                customerFirstname: User.firstname,
                customerLastname: User.lastname,
                customerAddress: User.address,
                customerCity: User.city,
                customerZipCode: User.zipCode,
                customerCountry: User.country,
                customerEmail: User.email,
                customerPhone: User.phone,
                status: sessionUser.hasPaid,
                ref_client: null,
                ref_invoice: null,
                test: "",
                level: "",
                createDate: new Date(),
                dueDate: new Date(),
            }


            await models['Invoice'].create(invoice);
            const message = `User : ${User.lastname} ${User.firstname} has been created.`;

            res.json({message, user:{User, institutHasUser, sessionUser, sessionUserOptions}})


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
 
