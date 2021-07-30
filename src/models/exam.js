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
            type: DataTypes.INTEGER,
            allowNull:true
        },
        label: {
            type:DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Exam:label cannot be empty !`},
                notNull: {msg: `Exam:label cannot be NULL!`}
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
        Exam.belongsTo(models.Test,{foreignKey:'test_id',onDelete:'SET NULL'});
        Exam.belongsTo(models.Level,{foreignKey:'level_id',onDelete:'SET NULL'});
        Exam.hasMany(models.sessionUserOption, {foreignKey:'exam_id',sourceKey: 'exam_id'});
        Exam.belongsToMany(models.Institut, {through: models.InstitutHasPrices, foreignKey:'exam_id'});
    };
  
    return Exam; 
}  