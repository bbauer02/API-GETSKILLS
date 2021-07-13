const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const ExamsPrice = sequelize.define('ExamsPrice', {
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
    }, {
        tableName: 'prices_exams',
        timestamps: false,
    });

    return ExamsPrice;
}   