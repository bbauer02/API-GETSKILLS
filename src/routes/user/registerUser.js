const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
const { format } = require('date-fns');

const {Invoice} = require('../invoice/invoice.class');



module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/users',isAuthenticated, isAuthorized,  async (req,res) => {
        try{
           
            const {user,institutHasUser, sessionUser, sessionUserOptions} = req.body; 
            // Création de l'utilisateur          
            user.systemRole_id = 1;
            const modelUser = await models['User'].create(user);
            const newUser = await models['User'].findOne({
                    where: {
                        user_id: modelUser.user_id
                    },
                    attributes:{exclude:['password']},
 
                    include: [
                        {
                            model: models['Country'],
                            as:'country',
                            attributes : ["label"]
                        },
                        {
                            model: models['Country'],
                            as:'nationality',
                            attributes : [["countryNationality",'label']]
                        },
                        {
                            model: models['Language'],
                            as:'firstlanguage',
                            attributes : ['nativeName']
                        },
                    ]
                });
            // Création de l'association entre l'utilisateur et l'institut 
            institutHasUser.user_id = newUser.user_id;
            institutHasUser.role_id =1 
            await models['institutHasUser'].create(institutHasUser);

            // Création de l'association entre l'utilisateur et la session
            sessionUser.user_id = newUser.user_id;
            const newSessionUser =await models['sessionUser'].create(sessionUser);
           /* const newSessionUser =  await models['sessionUser'].findOne( {
                where: {
                    session_id: +req.params.session_id,
                    user_id: +newUser.user_id
                }
            });*/


            // Création des options de l'utilisateur
            if(sessionUserOptions.length > 0) {
                const NewSessionUserOptions = sessionUserOptions.map(_option => ({
                    ..._option,
                    sessionUser_id: newSessionUser.sessionUser_id
                }));
                
               await models['sessionUserOption'].bulkCreate(NewSessionUserOptions);
            }
            const invoice = new Invoice(req.params.institut_id, req.params.session_id, newUser, newSessionUser);
            await invoice.generateInvoice()


           const message = 'user created';
           res.json({message, sessionUser: newUser})

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


