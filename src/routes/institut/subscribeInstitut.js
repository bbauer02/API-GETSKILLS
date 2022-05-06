const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');

const {stripe} =  require("../../../config.prod");
const Stripe = require('stripe')(config["stripe"][process.env.NODE_ENV].secretKey);
const bcrypt = require('bcrypt');

module.exports = (app) => {
  app.post('/api/instituts/subscribe', async (req,res) => {
    try{
      // On récupére les informations saisies dans les formulaires 
      const bodyInstitut = req.body.institut;
      const bodyUser = req.body.user;

      // On va créer un compte Stripe pour l'institut
      const stripeAccount = await Stripe.accounts.create({
        country: bodyInstitut.countryCode,
        type: 'express',
        capabilities: {
          card_payments: {requested: true},
          transfers: {requested: true},
        },
        email:bodyInstitut.email,
        business_type: 'company',
        business_profile: {
          mcc: "8299",
          name: bodyInstitut.label,
          support_email: bodyInstitut.email,
          support_phone: bodyInstitut.phone, 
          support_url: bodyInstitut.siteweb,
          support_address: {
            city:bodyInstitut.city,
            country:bodyInstitut.countryCode,
            line1:bodyInstitut.address,
            line2:bodyInstitut.address2,
            postal_code:bodyInstitut.zipcode
          },
          url: bodyInstitut.siteweb
        },
        company: {
          name: bodyInstitut.label,
          phone: bodyInstitut.phone,
          address: {
            city: bodyInstitut.city,
            country: bodyInstitut.countryCode,
            line1: bodyInstitut.adress1,
            line2: bodyInstitut.adress2,
            postal_code: bodyInstitut.zipcode,
          }
        },
        settings: {
          payments: {
            statement_descriptor:bodyInstitut.label.toUpperCase()
          }
        }
      }); 
      // On créé dans la BDD l'institut
      bodyInstitut.stripeId = stripeAccount.id; 
      const institut = await models['Institut'].create(bodyInstitut);
      // On créé dans la BDD le compte utilisateur
      // On convertie en entier les champs
      bodyUser.civility = parseInt(bodyUser.civility,10);
      bodyUser.gender = parseInt(bodyUser.gender,10);
      bodyUser.country_id = parseInt(bodyUser.country_id,10);
      bodyUser.password = await bcrypt.hash(bodyUser.password, 2);
      const user = await models['User'].create(bodyUser);

      // On créé le lien entre l'utilisateur et l'institut créé
      await models['institutHasUser'].create({
        "institut_id" : institut.institut_id,
        "user_id"     : user.user_id,
        "role_id"     : 4
      });
      // const message = `Institut : ${institut.label} has been created.`;
      res.json({'message' : "inscription réussie"}) 
     // res.json({message, data:institut})
    }catch(error) {
      if(error instanceof ValidationError) {
        console.log(error);
          return res.status(400).json({message:error.message, data:error})
      }
      if(error instanceof UniqueConstraintError) {
        console.log(error);
          return res.status(400).json({message: error.message, data:error})
      }
      console.log(error);
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error});
  }    

  });

}