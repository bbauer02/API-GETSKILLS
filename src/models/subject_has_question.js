module.exports = (sequelize, DataTypes) => {
    const SubjectHasQuestion = sequelize.define('SubjectHasQuestion', {
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Subjects", key: "subject_id" },
            onDelete: "CASCADE",
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Questions", key: "question_id" },
            onDelete: "CASCADE",
        }
    }, {
        tableName: "subject_has_question",
        timestamps: false,
    });

    return SubjectHasQuestion;
};
