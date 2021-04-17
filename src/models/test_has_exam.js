module.exports = (sequelize) => {
    const testHasExam =  sequelize.define('testHasExam', {},
    {
        tableName: 'test_has_exam',
        timestamps: false,
    });
    testHasExam.associate = models => {
        testHasExam.belongsTo(models.Test, { foreignKey: 'test_id', targetKey: 'test_id' });
        testHasExam.belongsTo(models.Exam, { foreignKey: 'exam_id', targetKey: 'exam_id' });
    }
    return testHasExam; 
}