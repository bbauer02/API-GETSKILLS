const createCheckoutSession = require('../../services/stripe/checkout');

module.exports = (app) => {
  app.post('/api/create-checkout-session',createCheckoutSession);  
}