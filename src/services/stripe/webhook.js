const stripeAPI  = require('../../../stripe');

function webhook(req, res) {
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
    console.log(event.data);
    console.log('Event data', session);
  }
  if( event.type == 'application_fee.created') {
    console.log("application_fee.created")
  }
  res.status(200).end();
}

module.exports = webhook;