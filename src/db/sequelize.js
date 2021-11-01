const config = require('../../config.prod');
const {Sequelize, DataTypes} = require('sequelize');

const ENV = require('dotenv').config().parsed;

let sequelize ="";

sequelize = new Sequelize(
    config.db[process.env.NODE_ENV].name,
    config.db[process.env.NODE_ENV].user,
    config.db[process.env.NODE_ENV].password,
    {
        host: config.db[process.env.NODE_ENV].host,
        port: config.db[process.env.NODE_ENV].port,
        dialect: config.db[process.env.NODE_ENV].dialect,
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            dialectOptions: {
                timezone:'Etc/GMT+2',  
            }
        }
        ,
        logging:false
    }
)

module.exports = sequelize;

