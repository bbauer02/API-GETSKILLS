module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        question_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Label cannot be empty!' },
                notNull: { msg: 'Label cannot be NULL!' }
            }
        },
        test_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        level_id: {
            type: DataTypes.INTEGER,
            allowNull: true  
        },
        instruction: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Instruction cannot be empty!' },
                notNull: { msg: 'Instruction cannot be NULL!' }
            }
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: { args: [1], msg: 'Duration must be at least 1 second!' }
            }
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: { args: [0], msg: 'Points cannot be negative!' }
            }
        },
        question_data: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    },
    {
        tableName: 'questions',
        timestamps: false,
    });

    Question.associate = models => {
        Question.belongsTo(models.Test, { foreignKey: 'test_id', targetKey: 'test_id', as: 'test' });
        Question.belongsTo(models.Level, { foreignKey: 'level_id', targetKey: 'level_id', as: 'level' });
        Question.hasMany(models.QuestionSkills, { foreignKey: 'question_id', sourceKey: 'question_id', as: 'questionSkills' });

        // 🔥 Utilisation du modèle pivot
        Question.belongsToMany(models.Subject, {
            through: models.SubjectHasQuestion, // 🔥 On passe le modèle Sequelize, pas une string
            foreignKey: "question_id",
            otherKey: "subject_id",
            as: "subjects",
        });
    };

    return Question;
};
