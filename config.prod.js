'use strict';

module.exports = {
  // App Name
  appName: 'API-GET-TESTED',
  // Public domain of API
  publicDomain : 'http://localhost:3000', 
  // Server port
  port : 3000,
  // Configuration for stripe
  // API Keys: https://dashboard.stripe.com/account/apikeys
  // Connect Settings: https://dashboard.stripe.com/account/applications/settings
  //https://dashboard.stripe.com/test/settings/connect
  stripe: {
    secretKey : 'sk_test_51HtBY6FuTsYUJRGzlVgQPdylwsYZZhA5SPqTAXjrVGeYRNvsj87cMKRuoKEDHSmKtjyhGV9LAO0XvjbY9Qpk2NSp003xNXUlSL',
    publishableKey: 'pk_test_51HtBY6FuTsYUJRGz7s7Y06bjDspi4sgQ2dQBbiHAAxZ6lw8FYmPYCS5GA8OgGmcjFPj1201lEENzkFrDEW0cr8DN00GNML65kd',
    whSecretKey : 'whsec_qvCn6ZZ2tEXOlTy7B3mYosHtXAfyF6aw',
    clientId: 'ca_K7Lz986uooZnu5LEVbNG2p7t90PMYJLA',
  },
  // Base de données
  db: {
    production : {
      host:'localhost',
      name:'gettested',
      user:'root',
      password:'',
      dialect:'mariadb',
      port:'3307'
    },
    development : {
        host:'localhost',
        name:'gettested',
        user:'root',
        password:'',
        dialect:'mariadb',
        port:'3307'
      }
  },
  // JW TOKEN
  jw: {
    accessToken: {
      type: 'Bearer',
      algorithm: 'HS256',
      secret: '3778214125442A472D4B6150645267556B58703273357638792F423F4528482B4D6251655468566D597133743677397A24432646294A404E635266556A586E5A',
      expiresIn: 3600000,
      audience: '',
      issuer: ''
    },
    refreshToken: {
      expiresIn:2592000000
    }
  }

}