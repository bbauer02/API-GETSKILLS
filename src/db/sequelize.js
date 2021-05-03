const {Sequelize, DataTypes} = require('sequelize');

const ENV = require('dotenv').config().parsed;

const sequelize = new Sequelize(
    ENV.DB_NAME,
    ENV.DB_USER,
    ENV.DB_PWD,
    {
        host: ENV.DB_HOST,
        port: ENV.DB_PORT,
        dialect: ENV.DB_DIALECT,
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            dialectOptions: {
                timezone:'Etc/GMT+2',  
            }
        }
        ,
        logging:true
    }
)

module.exports = sequelize;

