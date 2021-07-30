const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const InstitutHasPrices = sequelize.define('InstitutHasPrices', {
        price_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        institut_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 0.
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            primaryKey: true,
        },

    }, {
        tableName: 'Institut_has_prices',
        timestamps: false,
        uniqueKeys: {
            Items_unique: {
                fields: ['institut_id', 'exam_id', 'isAdmin']
            }
        },
        hooks: {
            beforeUpdate (instance, options) {
                console.log(instance.dataValues);
                models['InstitutHasPricesHist'].create(instance.dataValues);
            }
        }
    });

    return InstitutHasPrices;
}   