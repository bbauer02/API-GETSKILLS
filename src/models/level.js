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
            unique: {
                args : true,
                msg: 'Level:Label already exist!'
            },
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
        Level.hasMany(models.testHasLevel,{foreignKey:'level_id', targetKey:'level_id'})
    }
  
    return Level;
}