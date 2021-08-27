const stripeAPI  = require('../../../stripe');

async function  webhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeAPI.webhooks.constructEvent(
      req['rawBody'],
      sig,
      process.env.WEB_HOOK_SECRET
    )
  } catch(error) {
    return res.status(400).send(`WEBHOOK ERROR ${error.message}`);
  }

  if(event.type ==='checkout.session.completed') {
    const session = event.data.object;
    // On récupére l'identifiant de l'intention de payment
    const payment_intent = session.payment_intent;
    // On créé un objet contenant les informations de l'intention de payment.
    const paymentIntent = await stripeAPI.paymentIntents.retrieve(
      payment_intent,
      {
        expand: ['charges.data.balance_transaction'],
      }
    );
    // On récupére les détails de la transaction pour obtenir le charges prisent par STRIPE
    const feeDetails = paymentIntent.charges.data[0].balance_transaction.fee_details;
    // On ajoute l'utilisateur créé dans la table USER. 



    
  }
  if( event.type == 'application_fee.created') {
    console.log("application_fee.created")
  }
  res.status(200).end();
}

module.exports = webhook;