const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
const { format } = require('date-fns');

function generateInvoiceID(sessionID, userID, instituteID) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mois avec 2 chiffres
    const day = currentDate.getDate().toString().padStart(2, '0'); // Jour avec 2 chiffres
    const hours = currentDate.getHours().toString().padStart(2, '0'); // Heure avec 2 chiffres
    const minutes = currentDate.getMinutes().toString().padStart(2, '0'); // Minutes avec 2 chiffres
    const seconds = currentDate.getSeconds().toString().padStart(2, '0'); // Secondes avec 2 chiffres
  
    const invoiceID = `F${year}${month}${day}${hours}${minutes}${userID}`;
    return invoiceID;
  }

  function padWithZeros(number) {
    const numberString = number.toString();
    const zerosToAdd = 8 - numberString.length;
    
    if (zerosToAdd <= 0) {
      // Si le nombre est déjà de 5 caractères ou plus, retourne tel quel.
      return numberString;
    } else {
      // Ajoute des zéros au début du nombre.
      const paddedNumber = '0'.repeat(zerosToAdd) + numberString;
      return paddedNumber;
    }
  }

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/users',isAuthenticated, isAuthorized,  async (req,res) => {
        try{
            const {user,institutHasUser, sessionUser, sessionUserOptions} = req.body; 
            // Création de l'utilisateur          
            user.systemRole_id = 1;
            const modelUser = await models['User'].create(user);
            const newUser = await models['User'].findOne(
                {
                    where: {
                        user_id: modelUser.user_id
                    },
                    include: [
                        {
                            model: models['Country'],
                            as:'country',
                            attributes : ["label"]
                        }
                    ]
                }
            );
               
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

            // Infos de la session
            const Session = await models['Session'].findOne({
                where: {
                    institut_id: +req.params.institut_id,
                    session_id: +req.params.session_id,
                }
            });
            
            // Infos Test
            const includeTest = [];
            if(Session.level_id) {
                includeTest.push([
                    {
                        model: models['Level'],
                        where : { level_id: +Session.level_id }
                    }
                ])
            }
            const Test = await models['Test'].findOne({
                where: {
                    test_id: +Session.test_id
                },
                include: includeTest
            })
           
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
                level: Test.Levels ? Test.Levels[0].label : null,
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


