const webhook = require('../../services/stripe/webhook');

module.exports = (app) => {
  app.post('/api/webhook',webhook);  
}