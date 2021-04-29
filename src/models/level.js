module.exports = (sequelize, DataTypes) => {
    const Level =  sequelize.define('Level', {
        level_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Level:Label cannot be empty!`},
                notNull: {msg: `Level:Label cannot be NULL!`}
            }
        },
        ref: {
            type:DataTypes.STRING,
            allowNull:true
        },
        description :{
            type:DataTypes.TEXT,
            allowNull:true
        }
    },
    {
        tableName: 'levels',
        timestamps: false,
    });

    Level.associate = models => {
        Level.hasOne(models.Session, {foreignKey:'level_id',targetKey: 'level_id'});
        Level.belongsTo(models.Test,{foreignKey:'test_id',targetKey: 'test_id'})
        Level.hasOne(models.Exam, {foreignKey:'level_id',targetKey: 'level_id'});
    }
  
    return Level;
}