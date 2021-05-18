const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');
const token = require('./token');

let env = dotenv.config({});
if (env.error) throw env.error;
env = dotenvParseVariables(env.parsed);

/**
 * Global configuration.
 * @module config
 */
module.exports = {
  token: token(env),
};