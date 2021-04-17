const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(
    'gettested',
    'root',
    '',
    {
        host: 'localhost',
        port: 3307,
        dialect: 'mariadb',
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

