const {Sequelize, DataTypes} = require('sequelize');

const ENV = require('dotenv').config().parsed;

let sequelize ="";
if(process.env.NODE_ENV==='production') {
     sequelize = new Sequelize(
        'rh1rhjy5ye8ejxot',
        "x7zd923b3pklfhsk",
        "zmr1pv9skpgo5llv",
        {
            host: "f80b6byii2vwv8cx.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
            port: "3306",
            dialect: "mariadb",
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
            logging:true
        }
    )
}


module.exports = sequelize;

