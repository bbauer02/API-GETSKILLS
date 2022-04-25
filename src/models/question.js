module.exports = (sequelize, DataTypes) => {
    const Question =  sequelize.define('Question', {
        question_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        isWritten : {
            type: DataTypes.BOOLEAN
        },
        isAuto : {
            type: DataTypes.BOOLEAN
        },
        isTraining : {
            type: DataTypes.BOOLEAN
        },
        type: {
            type: DataTypes.INTEGER
        },
        instruction: {
            type: DataTypes.TEXT
        },
        point: {
            type: DataTypes.INTEGER
        },
        timemax: {
            type: DataTypes.INTEGER
        },
        skill_id: {
            type: DataTypes.INTEGER
        },
        answer: {
            type: DataTypes.JSON
        },
        medias: {
            type: DataTypes.JSON
        }
    },
     {
         tableName: 'questions',
         timestamps: false,
     });

     Question.associate = models => {
        Question.belongsTo(models.Skill, {foreignKey: 'skill_id', targetKey: 'skill_id'});
        Question.belongsTo(models.Exam, {foreignKey: 'skill_id'});
        Question.belongsToMany(models.Exam, { through: models.examHasQuestion, foreignKey: 'question_id' });
    }
     return Question;
}