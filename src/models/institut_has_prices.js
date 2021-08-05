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
        }
    }, {
        tableName: 'Institut_has_prices',
        timestamps: false,
        hooks: {
            beforeUpdate (instance, options) {
                console.log(instance.dataValues);
                models['InstitutHasPricesHist'].create(instance.dataValues);
            }
        }
    });
    InstitutHasPrices.associate = models => {
        InstitutHasPrices.belongsTo(models.Exam,{foreignKey:'exam_id'});
        InstitutHasPrices.belongsTo(models.Institut,{foreignKey:'institut_id'});
    };
    return InstitutHasPrices;
}   