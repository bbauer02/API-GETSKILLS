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
    production : {
      secretKey : '',
      publishableKey: '',
      whSecretKey : '',
      clientId: '',
     },
     development : {
      secretKey : '',
      publishableKey: '',
      whSecretKey : '',
      clientId: '',
     }
  },
  // Base de données
  db: {
    production : {
      host:'',
      name:'',
      user:'',
      password:'',
      dialect:'',
      port:''
    },
    development : {
        host:'',
        name:'',
        user:'',
        password:'',
        dialect:'',
        port:''
      }
  },
  // JW TOKEN
  jw: {
    accessToken: {
      type: '',
      algorithm: '',
      secret: '',
      expiresIn: 3600000,
      audience: '',
      issuer: ''
    },
    refreshToken: {
      expiresIn:2592000000
    }
  }

}