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
        },
    }, {
        tableName: 'prices_exams',
        timestamps: false,
    });

    return ExamsPrice;
}   