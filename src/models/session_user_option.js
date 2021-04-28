module.exports = (sequelize, DataTypes) => {
    const sessionUserOption =  sequelize.define('sessionUserOption', {
        option_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
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
        },
        sessionUser_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        tableName: 'session_user_option', 
        timestamps: false
    });
    sessionUserOption.associate = models => { 
        sessionUserOption.belongsTo(models.sessionUser, { foreignKey: 'sessionUser_id', targetKey: 'sessionUser_id' });
    };
    
    return sessionUserOption;
}
 