module.exports = (sequelize, DataTypes) => {
    const QuestionSkills = sequelize.define('QuestionSkills', {
        question_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        skill_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        tableName: 'question_skills',
        timestamps: false, 
        freezeTableName: true
    });

    QuestionSkills.associate = models => {
        QuestionSkills.belongsTo(models.Skill, { foreignKey: 'skill_id',targetKey: 'skill_id',as: 'skill'});
        QuestionSkills.belongsTo(models.Question, { foreignKey: 'question_id',targetKey: 'question_id',as: 'questions'});
    }

    return QuestionSkills;
};
