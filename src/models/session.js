module.exports = (sequelize, DataTypes) => {
    const Session =  sequelize.define('Session', {
        session_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull:false
        },
        institut_id: {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Session:institut_id cannot be empty!`},
                notNull: {msg: `Session:institut_id cannot be NULL!`}
            }
        },
        start: {
            type: DataTypes.DATE,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Session:start cannot be empty!`},
                notNull: {msg: `Session:start cannot be NULL!`}
            }
        },
        end: {
            type: DataTypes.DATE,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Session:end cannot be empty!`},
                notNull: {msg: `Session:end cannot be NULL!`}
            }
        },
        limitDateSubscribe: {
            type: DataTypes.DATE,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Session:limitDateSubscribe cannot be empty!`},
                notNull: {msg: `Session:limitDateSubscribe cannot be NULL!`}
            }
        },
        placeAvailable: {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Session:placeAvailable cannot be empty!`},
                notNull: {msg: `Session:placeAvailable cannot be NULL!`}
            }
        },
        validation: {
            type: DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue: false,
            validate : {
                notEmpty:{msg: `Session:validation cannot be empty!`},
                notNull: {msg: `Session:validation cannot be NULL!`}
            }
        },
        test_id:{
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Session:testLevel_id cannot be empty!`},
                notNull: {msg: `Session:testLevel_id cannot be NULL!`}
            }
        },
        level_id:{
            type: DataTypes.INTEGER,
            allowNull:true
        } 
    },
    {
        tableName: 'sessions',
        timestamps: false
    });
    Session.associate = models => { 
        Session.hasMany(models.sessionUser,{foreignKey:'session_id', sourceKey:'session_id'})
        Session.belongsTo(models.Institut,{foreignKey:'institut_id',sourceKey: 'institut_id'});
        Session.belongsTo(models.Test,{foreignKey:'test_id'});
        Session.belongsTo(models.Level,{foreignKey:'level_id'});
    };
    return Session;
}
   