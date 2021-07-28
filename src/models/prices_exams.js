const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const ExamsPrice = sequelize.define('ExamsPrice', {
        price_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
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
        isAdmin: {
            type: DataTypes.BOOLEAN,
        }

    }, {
        tableName: 'prices_exams',
        timestamps: false,
        hooks: {
            beforeUpdate (instance, options) {
                console.log(instance.dataValues);
                models['ExamPricesHist'].create(instance.dataValues);
            }
        }
    });

    return ExamsPrice;
}   