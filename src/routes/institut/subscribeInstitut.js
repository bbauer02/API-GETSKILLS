const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');

const {stripe} =  require("../../../config.prod");
const Stripe = require('stripe')(stripe.secretKey);

module.exports = (app) => {
  app.post('/api/instituts/subscribe', async (req,res) => {
    try{
      const institut = await models['Institut'].create(req.body.institut);
      const User = req.body.user;
      User.civility = parseInt(User.civility);
      User.gender = parseInt(User.gender);
      User.country_id = parseInt(User.country_id);
      const user = await models['User'].create(User);

      const institut_has_user = {
        "institut_id" : institut.institut_id,
        "user_id"     : user.user_id,
        "role_id"     : 4
      }
      await models['institutHasUser'].create(institut_has_user);
      // const message = `Institut : ${institut.label} has been created.`;
      res.json({'message' : "inscription réussie"})
     // res.json({message, data:institut})
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