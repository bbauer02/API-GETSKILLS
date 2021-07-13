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

    ExamsPrice.associate = models => {
        ExamsPrice.hasMany(models.Institut, {foreignKey:'institut_id', sourceKey: 'institut_id', timestamps: false});
        ExamsPrice.hasMany(models.Exam, {foreignKey:'exam_id', sourceKey: 'exam_id', timestamps: false});
    }

    return ExamsPrice;
}   