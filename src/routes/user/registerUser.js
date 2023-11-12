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
            await models['sessionUser'].create(sessionUser);
            const newSessionUser =  await models['sessionUser'].findOne( {
                where: {
                    session_id: +req.params.session_id,
                    user_id: +newUser.user_id
                }
            });

            // Création des options de l'utilisateur
            if(sessionUserOptions.length > 0) {
                const NewSessionUserOptions = sessionUserOptions.map(_option => ({
                    ..._option,
                    sessionUser_id: newSessionUser.sessionUser_id
                }));
                
               await models['sessionUserOption'].bulkCreate(NewSessionUserOptions);
            }




            const invoice = new Invoice(req.params.institut_id, req.params.session_id, newUser);
            await invoice.initialize();


           const message = 'user created';
           res.json(invoice)
/*
            
          
            // création de la facture
            const createDate = new Date();
            const dueDate = createDate.setDate(createDate.getDate() + 45)
            
            const userRef = padWithZeros(+newUser.user_id)
            const invoice = {
                institut_id: +req.params.institut_id,
                session_id: +req.params.session_id,
                user_id: +newUser.user_id,
                session: `Session du ${format(Session.start, 'dd/MM/yyyy')} au ${format(Session.end, 'dd/MM/yyyy')}`,
                customerFirstname: newUser.firstname,
                customerLastname: newUser.lastname,
                customerAddress1: newUser.adress1,
                customerAddress2: newUser.adress2,
                customerCity: newUser.city,
                customerZipCode: newUser.zipcode,
                customerCountry: newUser.country.label,
                customerEmail: newUser.email,
                customerPhone: newUser.phone,
                status: newSessionUser.hasPaid,
                ref_client: `REF-${userRef}`,
                ref_invoice: generateInvoiceID(+req.params.session_id,+newUser.user_id,+req.params.institut_id),
                test: Test.label,
                level: Level ? Level.label : null,
                createDate: new Date(),
                dueDate, 
            }

           const newInvoice = await models['Invoice'].create(invoice);
         
          // On doit maintenant ajouter la liste des épreuves obligatoires + les options
          const SessionHasExams = await models['sessionHasExam'].findAll(
            {
                where: {session_id: +req.params.session_id},
                include: [
                    {
                        model: models['Exam'],
                        include: [{
                            model: models['InstitutHasPrices'],
                            required: false,
                            attributes: ['price', 'tva'],
                            where: {
                                institut_id: req.params.institut_id, 
                            }
                        }]
                    }
                ]
            }
          );
            // On ne récupére que les options obligatoires 
          const optionsObligatoires  = SessionHasExams.filter(_sessionHasExam => {
            // On vérifie si isOption est false
            const isOptionCondition = _sessionHasExam.Exam.isOption === false;
            // Vérifie si exam_id n'est pas présent dans le tableau des options sessionUserOptions
            const isNowUserOption = !sessionUserOptions.some(_userOption => _userOption.exam_id === _sessionHasExam.Exam.exam_id);
            // Retourne true uniquement si les deux conditions sont satisfaites
            return isOptionCondition && isNowUserOption;
        
        });
 
        // On va creer des lignes dans la facture contenant dans un premier temps 
        const invoiceLines = [];
        optionsObligatoires.forEach(_option => {
            invoiceLines.push({
                invoice_id: +newInvoice.invoice_id,
                label: _option.Exam.label,
                price_HT: _option.Exam.InstitutHasPrices.length > 0 ? _option.Exam.InstitutHasPrices[0].price : _option.Exam.price,
                tva: _option.Exam.InstitutHasPrices.length > 0 ? _option.Exam.InstitutHasPrices[0].tva : 22,
            }) 
        });

        // On va maintenant ajouter les options 
        sessionUserOptions.forEach(_option => {
            const SessionHasExam = SessionHasExams.filter(_sessionHasExam => _sessionHasExam.exam_id === _option.exam_id && _sessionHasExam.session_id === +req.params.session_id)[0];
            invoiceLines.push({
                invoice_id: +newInvoice.invoice_id,
                label: SessionHasExam.Exam.label,
                price_HT: _option.user_price,
                tva: _option.tva
            })
        })

        await models['InvoiceLines'].bulkCreate(invoiceLines);


            const message = 'user created';
            res.json({message})
*/
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


