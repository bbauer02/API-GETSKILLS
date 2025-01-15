module.exports = (sequelize, DataTypes) => {
    const Question =  sequelize.define('Question', {
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
            allowNull: true  // Pour permettre null pour TOEIC
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
            validate: {
                isValidQuestionData(value) {
                    if (!value.type) {
                        throw new Error('Question type is required!');
                    }
                    if (!value.content) {
                        throw new Error('Question content is required!');
                    }
                    // Validation spécifique selon le type
                    switch (value.type) {
                        case 'MCQ':
                        case 'UCQ':
                            if (!Array.isArray(value.content.choices)) {
                                throw new Error('Choices must be an array!');
                            }
                            break;
                        case 'FillInTheBlanks':
                            if (!Array.isArray(value.content.answers)) {
                                throw new Error('Answers must be an array!');
                            }
                            break;
                        // ... autres validations selon les types
                    }
                }
            }
        }
    },
     {
         tableName: 'questions',
         timestamps: false,
     });

    Question.associate = models => {
        Question.belongsTo(models.Test, { foreignKey: 'test_id',targetKey: 'test_id',as: 'test'});
        Question.belongsTo(models.Level, { foreignKey: 'level_id',targetKey: 'level_id',as: 'level'});
    }

    
     return Question;
}