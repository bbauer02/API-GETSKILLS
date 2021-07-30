module.exports = (sequelize, DataTypes) => {
    const sessionUserHist =  sequelize.define('sessionUserHist', {
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
        numInscrAnt: {
            type: DataTypes.STRING,
            allowNull: true
        },
        inscription: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        hasPaid: {
            type: DataTypes.BOOLEAN
        },
        informations: {
            type: DataTypes.TEXT
        },
    },
    {
        tableName: 'session_user_hist',
        timestamps: false,
        uniqueKeys: {
            compositeKey: {
                fields: ['session_id', 'user_id']
            }
        }
    });
    /*
    sessionUserHist.associate = models => { 
        sessionUserHist.belongsTo(models.User, { foreignKey: 'user_id', sourceKey: 'user_id'});
        sessionUserHist.belongsTo(models.Session, { foreignKey: 'session_id', sourceKey: 'session_id' });
        sessionUserHist.hasMany(models.sessionUserOption,{foreignKey:'sessionUser_id',sourceKey: 'sessionUser_id',onDelete:'CASCADE'})
    };
    */

    return sessionUserHist;
}
