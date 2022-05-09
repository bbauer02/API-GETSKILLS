const stripeAPI  = require('../../../stripe');
const { Op } = require('sequelize');
const {models} = require('../../models');

async function createCheckoutSession(req, res) {
  try {
    const domainUrl = process.env.WEB_APP_URL;
    const { examsId, email, institut_id, session_id, sessionUser_id } = req.body;
    // check req body has line items and email
    if ( examsId.length == 0 || !email ) {
      return res.status(400).json({ error: 'missing required session parameters'});
    }
    const parameters = {};
    parameters.where = {
      exam_id: {[Op.in]: examsId }
    };
    parameters.include = [{
      model: models['InstitutHasPrices'],
      required: false,
      where: {institut_id }
    }];
    const exams = await models['Exam'].findAll(parameters);
    let amount = 0;
    const line_items = [];
    // CALCUL DU TOTAL
    exams.map((exam) => {
      const item = {
        name: exam.label,
        quantity: 1,
        currency: 'eur'
      }
      if(exam.InstitutHasPrices.length > 0) {
        ttc = exam.InstitutHasPrices[0].price + Math.round((exam.InstitutHasPrices[0].price * (exam.InstitutHasPrices[0].tva/100) ) );
        amount += ttc;
        item.amount = ttc*100;
      }
      else {
        amount += exam.price;
        item.amount = exam.price*100;
      } 
      line_items.push(item);
    })
    // RECUPERATION DE L IDENTIFIANT STRIPE DE L'INSTITUT
    const Institut = await models['Institut'].findByPk(institut_id);
    const StripeAccount = Institut.stripeId;

    session = await stripeAPI.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      customer_email:email,
      metadata : {
        institut_id : institut_id,
        session_id : session_id,
        sessionUser_id : sessionUser_id
      },
      payment_intent_data: {
        application_fee_amount: 123,
        transfer_data: {
          destination: StripeAccount,
        },
      },
      mode: 'payment',
      success_url: `${domainUrl}/auth/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/auth/register/canceled`
    });
  // res.status(200).json({sessionId: session.id});
    //res.status(200).json({sessionId: "1"});
  } catch (error) {
    res.status(400).json({error: 'an error occured, unable to create session'});
  }

}

module.exports = createCheckoutSession;