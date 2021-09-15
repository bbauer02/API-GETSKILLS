let API_SECRET_KEY ='';
if(process.env.NODE_ENV==='development') {
  API_SECRET_KEY = 'sk_test_51HtBY6FuTsYUJRGzlVgQPdylwsYZZhA5SPqTAXjrVGeYRNvsj87cMKRuoKEDHSmKtjyhGV9LAO0XvjbY9Qpk2NSp003xNXUlSL';
}
const stripeAPI = require('stripe')(API_SECRET_KEY);



module.exports = stripeAPI;