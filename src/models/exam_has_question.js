module.exports = (sequelize, DataTypes) => {  
   
    const examHasQuestion =  sequelize.define('examHasQuestion', {
        exam_id: {
            type: DataTypes.INTEGER,
        },
        question_id: {
            type: DataTypes.INTEGER,
        }
    },
    {
        tableName: 'exam_has_question', 
        timestamps: false
    });
    examHasQuestion.associate = models => {
        examHasQuestion.belongsTo(models.Exam, { foreignKey: 'exam_id', sourceKey: 'exam_id' });
        examHasQuestion.belongsTo(models.Question, { foreignKey: 'question_id', sourceKey: 'question_id' });
    }
    return examHasQuestion;
}