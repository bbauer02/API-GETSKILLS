module.exports = (sequelize, DataTypes) => {
    const Exam =  sequelize.define('Exam', {
        exam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        test_id:{
            type: DataTypes.INTEGER
        },
        level_id:{
            type: DataTypes.INTEGER
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
            type: DataTypes.INTEGER
        },
        successScore: {
            type: DataTypes.INTEGER
        } 
    },
    {
        tableName: 'exams', 
        timestamps: false
    });
    Exam.associate = models => { 
/*Exam.belongsTo(models.Test,{foreignKey:'test_id'});
        Exam.belongsTo(models.Level,{foreignKey:'level_id'});*/
    };
 
    return Exam; 
} 