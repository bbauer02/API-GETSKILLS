const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const ExamsPriceHist = sequelize.define('ExamPricesHist', {
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
        tableName: 'prices_exams_hist',
        timestamps: true,
    });

    return ExamsPriceHist;
}   