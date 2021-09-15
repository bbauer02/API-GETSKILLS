const {Sequelize, DataTypes} = require('sequelize');

const ENV = require('dotenv').config().parsed;

let sequelize ="";
if(process.env.NODE_ENV==='production') {
    sequelize = new Sequelize(
        ENV.DB_NAME_PROD,
        ENV.DB_USER_PROD,
        ENV.DB_PWD_PROD,
        {
            host: ENV.DB_HOST_PROD,
            port: ENV.DB_PORT_PROD,
            dialect: ENV.DB_DIALECT_PROD,
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
}
else {
    sequelize = new Sequelize(
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
            logging:false
        }
    )
}


module.exports = sequelize;

