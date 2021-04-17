module.exports = (sequelize, DataTypes) => {
    const Session =  sequelize.define('Session', {
        session_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        institut_id: {
            type: DataTypes.INTEGER
        },
        start: {
            type: DataTypes.DATE
        },
        end: {
            type: DataTypes.DATE
        },
        limitDateSubscribe: {
            type: DataTypes.DATE
        },
        placeAvailable: {
            type: DataTypes.INTEGER
        } ,
        testLevel_id:{
            type: DataTypes.INTEGER
        }
    },
    {
        tableName: 'sessions',
        timestamps: false
    });
    Session.associate = models => { 
        Session.hasMany(models.sessionHasUser,{foreignKey:'session_id', targetKey:'session_id'})
        Session.belongsTo(models.Institut,{foreignKey:'institut_id',targetKey: 'institut_id'});
        Session.belongsTo(models.testHasLevel, { foreignKey: 'testLevel_id' ,targetKey: 'testLevel_id'});
    };
    return Session;
}
