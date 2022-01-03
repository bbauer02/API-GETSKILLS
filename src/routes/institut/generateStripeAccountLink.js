const {models} = require('../../models');
const {stripe, publicDomain} =  require("../../../config.prod");
const Stripe = require('stripe')(stripe.secretKey);
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.get('/api/instituts/stripeaccountlink/generate', isAuthenticated, isAuthorized,  async (req,res) => {
    try {
      // On récupére l'identifiant de l'institut concerné : dans l'uRL, ou dans le body .
      const reqInstitut_id = req.params.institut_id || req.body.institut_id || req.query.institut_id || null;
      // On récupére l'identifiant STRIPE de l'institut.
      if(reqInstitut_id) {
        const Institut = await models['Institut'].findByPk(reqInstitut_id);
        const accountLink = await Stripe.accountLinks.create({
          account: Institut.stripeId,
          refresh_url: `${publicDomain}/dashboard/instituts/${reqInstitut_id}/reauthstripe`,
          return_url: `${publicDomain}/dashboard/home`,
          type: 'account_onboarding',
      });
      return res.status(200).json({message: 'StripeAccountLink generated', accountLink})
      }
      else {
        const message = `Institut ID non valide`;
        return res.status(400).json({message})
      }
    }
    catch (error) {
        const message = `Service not available. Please retry later.`;
        res.status(500).json({message, data: error});
    }

  });
}