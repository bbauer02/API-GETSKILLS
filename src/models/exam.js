module.exports = (sequelize, DataTypes) => {
    const Exam =  sequelize.define('Exam', { 
        exam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type:DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Exam:label cannot be empty !`},
                notNull: {msg: `Exam:label cannot be NULL!`}
            },
            unique: {
                args : true,
                msg: 'Exam:Label already exist!'
            }
        },
        isWritten : {
            type: DataTypes.BOOLEAN
        },
        isOption : {
            type: DataTypes.BOOLEAN
        },
        price : {
            type: DataTypes.INTEGER
        },
        coeff : {
            type: DataTypes.INTEGER
        },
        nbrQuestions : {
            type: DataTypes.INTEGER
        },
        duration: {
            type: DataTypes.TIME
        }
    },
    {
        tableName: 'exams',
        timestamps: false
    });
    Exam.associate = models => {
        Exam.belongsToMany(models.Test,  {through:models.testHasExam,foreignKey:'exam_id', otherKey:'test_id',timestamps: false });
        Exam.belongsToMany(models.sessionHasUser,  {through:models.sessionUserOption,foreignKey:'exam_id', otherKey:'sessionUser_id',timestamps: false });
    }
    return Exam;
}
