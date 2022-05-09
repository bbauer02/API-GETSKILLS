const {models} = require('../../models');
const stripeAPI  = require('../../../stripe');
const config = require('../../../config.prod');

async function  webhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeAPI.webhooks.constructEvent(
      req['rawBody'],
      sig,
      config.stripe[process.env.NODE_ENV].whSecretKey
    )
  } catch(error) {
    return res.status(400).send(`WEBHOOK ERROR ${error.message}`);
  }
  //  account.updated 
  //  account.external_account.created
  if(event.type ==='account.updated') {
    const account = event.data.object;
    // On va vérifier si les informations bancaires sont validées dans STRIPE.
    const institut = await models['Institut'].findOne({where: {stripeId : account.id}});
    if(!institut.stripeActivated && account.capabilities.transfers === 'active') {
      await institut.update({stripeActivated: 1},{
        where:{stripeId : account.id}
      });
    }

  }

  if(event.type ==='checkout.session.completed') {
    const {sessionUser_id} = event.data.object.metadata;
    const sessionUser = await models['sessionUser'].findByPk(sessionUser_id);
    await sessionUser.update({ hasPaid: 1 });   

  }
  if( event.type == 'application_fee.created') {
    console.log("application_fee.created")
  }
  res.status(200).end();
}

module.exports = webhook;