const config = require('./config.prod');
const stripeAPI = require('stripe')(config["stripe"][process.env.NODE_ENV].secretKey);
module.exports = stripeAPI;