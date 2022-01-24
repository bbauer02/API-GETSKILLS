const {models} = require("./index");
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
            type: DataTypes.INTEGER,
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
            type: DataTypes.BOOLEAN,
            default: false
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
        },
        hooks: {
            beforeDestroy (instance, options) {
                // console.log(instance.dataValues);
                models['sessionUserHist'].create(instance.dataValues);
            }
        }
    });
    
    sessionUser.associate = models => { 
        sessionUser.belongsTo(models.User, { foreignKey: 'user_id', sourceKey: 'user_id', onDelete: 'CASCADE'});
        sessionUser.belongsTo(models.Session, { foreignKey: 'session_id', sourceKey: 'session_id' });
        sessionUser.hasMany(models.sessionUserOption,{foreignKey:'sessionUser_id',sourceKey: 'sessionUser_id'});
        sessionUser.hasMany(models.sessionExamHasExaminator, { foreignKey: 'sessionUser_id', sourceKey: 'sessionUser_id' });
    };

    return sessionUser;
}
