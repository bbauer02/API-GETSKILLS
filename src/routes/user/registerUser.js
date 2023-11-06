const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/users',isAuthenticated, isAuthorized,  async (req,res) => {
        try{

            const {user,institutHasUser, sessionUser, sessionUserOptions} = req.body;
            // Création du compte utilisateur
            user.systemRole_id = 1;
           // const User = await models['User'].create(user);
            
         /*   const createdUser = await models['User'].findOne(
            {
                where: {
                    user_id: User.user_id
                },
                include: [
                    {
                        model: models['Country'],
                        as:'country',
                        attributes : ["label"]
                    }
                ]
            });*/
            
            // Inscription de l'utilisateur dans l'institut organisateur de l'épreuve
           // institutHasUser.user_id = createdUser.user_id;
            //institutHasUser.role_id =1
           // await models['institutHasUser'].create(institutHasUser);
            // Inscription de l'utilisateur dans la session

         //   sessionUser.user_id = createdUser.user_id;
         
           sessionUser.user_id = 518;
            sessionUser.inscription = new Date();
            console.log("here" , sessionUser)
            const newSessionUser = await models['sessionUser'].create(sessionUser);
            console.log("here2", newSessionUser)
            // Inscription des options de l'utilisateur
           /*if(sessionUserOptions.length > 0) {
                const sessionUserOptionsMAJ = sessionUserOptions.map(_option => ({
                    ..._option,
                    sessionUser_id: newSessionUser.sessionUser_id
                }));
                console.log(newSessionUser)

                await models['sessionUserOption'].bulkCreate(sessionUserOptionsMAJ);
            }



            const Session = await models['Session'].findOne({
                where: {
                    session_id,
                    institut_id
                }
            })
            console.log(Session)

            const Test = await models['Test'].findOne({
                where: {
                    test_id: Session.test_id
                },
                include: [
                    {
                        model: models['Level'],
                        as: 'level',
                        attributes: ['label'],
                        where: {
                            level_id: Session.level_id
                        }   
                    }
                ]
            })
console.log(Test)

            const invoice = {
                institut_id: institutHasUser.institut_id,
                session_id: sessionUser.session_id,
                user_id: User.user_id,
                session: `Session du ${new Date()} au ${new Date()}`,
                customerFirstname: createdUser.firstname,
                customerLastname: createdUser.lastname,
                customerAddress1: createdUser.adress1,
                customerAddress2: createdUser.adress2,
                customerCity: createdUser.city,
                customerZipCode: createdUser.zipcode,
                customerCountry: createdUser.country.label,
                customerEmail: createdUser.email,
                customerPhone: createdUser.phone,
                status: sessionUser.hasPaid,
                ref_client: null,
                ref_invoice: null,
                test: Test.label,
                level: Test.level.label,
                createDate: new Date(),
                dueDate: new Date(),
            }
                console.log(invoice)
           // await models['Invoice'].create(invoice);
            const message = `User : ${User.lastname} ${User.firstname} has been created.`; */

            res.json({message, response: "OK"})


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
 
