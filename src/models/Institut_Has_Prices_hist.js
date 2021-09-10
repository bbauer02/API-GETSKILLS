const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const InstitutHasPriceHist = sequelize.define('InstitutHasPricesHist', {
        institut_id: {
            type: DataTypes.INTEGER,
        },
        exam_id: {
            type: DataTypes.INTEGER,
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 0.
        },
        tva: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 20.
        }
    }, {
        tableName: 'Institut_Has_Prices_Hist',
        timestamps: true,
    });

    return InstitutHasPriceHist;
}   