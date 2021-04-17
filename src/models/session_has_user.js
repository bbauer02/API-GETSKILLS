module.exports = (sequelize, DataTypes) => {
    const sessionHasUser =  sequelize.define('sessionHasUser', {
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
        tableName: 'session_has_user',
        timestamps: false,
        uniqueKeys: {
            compositeKey: {
                fields: ['session_id', 'user_id']
            }
        }
    });
    sessionHasUser.associate = models => { 
        sessionHasUser.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
        sessionHasUser.belongsTo(models.Session, { foreignKey: 'session_id', targetKey: 'session_id' });
        sessionHasUser.belongsToMany(models.Exam,  {through:models.sessionUserOption,foreignKey:'sessionUser_id', otherKey:'exam_id',timestamps: false });
    };
    
    return sessionHasUser;
}
