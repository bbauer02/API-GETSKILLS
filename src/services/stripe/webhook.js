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

    /*
    /api/instituts/:institut_id/sessions/:session_id/users

    {
      user_id: '',
      login: 'dgg',
      email: 'dfgdg@fdgdg.com',
      phone: '0707070707',
      civility: '2',
      gender: '2',
      firstname: 'dfg',
      lastname: 'dfg',
      adress1: 'ghjghjghj',
      adress2: '',
      zipcode: '75757',
      city: 'dfgdfg',
      country_id: '12',
      birthday: '2021-08-31',
      nationality_id: '13',
      firstlanguage_id: '22',
      hasPaid: true,
      paymentMode: '2',
      password: 'Changeme+02',
      passwordConfirmation: 'Changeme+02',
      level_id: null,
      test_id: 4
    }
     */
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