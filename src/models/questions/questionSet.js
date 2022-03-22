module.exports = (sequelize, DataTypes) => {
    const QuestionSet =  sequelize.define('QuestionSet', {

    },
     {
         tableName: 'question_set',
         timestamps: false,
     });
}