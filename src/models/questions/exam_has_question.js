module.exports = (sequelize, DataTypes) => {
    const ExamHasQuestion =  sequelize.define('ExamHasQuestion', {

    },
     {
         tableName: 'exam_has_question',
         timestamps: false,
     });
}