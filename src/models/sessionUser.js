module.exports = (sequelize, DataTypes) => {
    const sessionUser =  sequelize.define('sessionUser', {
        sessionUser_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        session_id: {
            type: DataTypes.INTEGER,
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        paymentMode: {
            type: DataTypes.INTEGER
        },
        hasPaid: {
            type: DataTypes.BOOLEAN
        },
        informations: {
            type: DataTypes.TEXT
        },

    },
    {
        tableName: 'sessionUsers',
        timestamps: false,
        uniqueKeys: {
            compositeKey: {
                fields: ['session_id', 'user_id']
            }
        }
    });
    sessionUser.associate = models => { 
        sessionUser.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id',onDelete:'CASCADE' });
        sessionUser.belongsTo(models.Session, { foreignKey: 'session_id', targetKey: 'session_id' });
        sessionUser.hasMany(models.sessionUserOption,{foreignKey:'sessionUser_id',targetKey: 'sessionUser_id'})
    };
    
    return sessionUser;
}
