// models/examHasSkill.js
module.exports = (sequelize, DataTypes) => {
    const ExamHasSkill = sequelize.define('ExamHasSkill', {
        exam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'exams',
                key: 'exam_id'
            }
        },
        skill_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'skills',
                key: 'skill_id'
            }
        }
    }, {
        tableName: 'exam_has_skills',
        timestamps: false
    });

    // Association avec les modèles Exam et Skill
    ExamHasSkill.associate = models => {
        ExamHasSkill.belongsTo(models.Exam, { foreignKey: 'exam_id' });
        ExamHasSkill.belongsTo(models.Skill, { foreignKey: 'skill_id' });
    };

    return ExamHasSkill;
};