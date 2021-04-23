module.exports = (sequelize, DataTypes) => {
    const sessionUserOption =  sequelize.define('sessionUserOption', {
        
        user_price: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        addressExam: {
            type: DataTypes.TEXT
        },
        isCandidate: {
            type: DataTypes.BOOLEAN
        },
        DateTime: {
            type: DataTypes.DATE
        } 
    },
    {
        tableName: 'session_user_option', 
        timestamps: false
    });
    sessionUserOption.associate = models => { 
        sessionUserOption.belongsTo(models.sessionUser, { foreignKey: 'sessionUser_id', targetKey: 'sessionUser_id' });
     //   sessionUserOption.belongsTo(models.Exam, { foreignKey: 'exam_id', targetKey: 'exam_id' });
    };
    
    return sessionUserOption;
}
