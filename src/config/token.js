module.exports = (env) => ({
    accessToken: {
      type: env.ACCESS_TOKEN_TYPE || 'Bearer',
      algorithm: env.ACCESS_TOKEN_ALGORITHM || 'HS256',
      secret: env.ACCESS_TOKEN_SECRET,
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
      audience: env.ACCESS_TOKEN_AUDIENCE,
      issuer: env.ACCESS_TOKEN_ISSUER
    },
    refreshToken: {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
    }
  });