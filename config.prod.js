'use strict';

module.exports = {
  // App Name
  appName: process.env.APPNAME,
  // Public domain of API
  publicDomain : process.env.PUBLIC_URL+':'+process.env.API_PORT,
  // Server port
  port : process.env.API_PORT,
  // Configuration for stripe
  stripe: {
    production : {
      secretKey : process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUB_KEY,
      whSecretKey : process.env.STRIPE_WHSECRET,
      clientId: process.env.STRIPE_CLIENTID,
     },
     development : {
      secretKey : process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUB_KEY,
      whSecretKey : process.env.STRIPE_WHSECRET,
      clientId: process.env.STRIPE_CLIENTID,
     }
  },
  // Base de données
  db: {
    production : {
      host:process.env.DB_HOST,
      name:process.env.MYSQL_DATABASE,
      user:process.env.MYSQL_USER,
      password:process.env.MYSQL_PASSWORD,
      dialect:process.env.MYSQL_DIALECT,
      port:process.env.MYSQL_TCP_PORT
    },
    development : {
        host:process.env.DB_HOST,
        name:process.env.MYSQL_DATABASE,
        user:process.env.MYSQL_USER,
        password:process.env.MYSQL_PASSWORD,
        dialect:process.env.MYSQL_DIALECT,
        port:process.env.MYSQL_TCP_PORT
      }
  },
  // JW TOKEN
  jw: {
    accessToken: {
      type: 'Bearer',
      algorithm: process.env.TOKEN_JWT_ALGO,
      secret: process.env.TOKEN_JWT_SECRET,
      expiresIn: process.env.TOKEN_JWT_EXPIREIN,
      audience: '',
      issuer: ''
    },
    refreshToken: {
      expiresIn: process.env.TOKEN_REFRESH_EXPIREIN,
    }
  }

}

