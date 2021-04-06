const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(
    'gettested',
    'root',
    '',
    {
        host: 'localhost',
        port: 3307,
        dialect: 'mariadb',
        dialectOptions: {
            timezone:'Etc/GMT-2'
        },
        logging:true
    }
)

module.exports = sequelize;

