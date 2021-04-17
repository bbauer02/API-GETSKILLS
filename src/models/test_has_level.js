module.exports = (sequelize, DataTypes) => {
    const testHasLevel =  sequelize.define('testHasLevel', {
        testLevel_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        test_id:{
            type: DataTypes.INTEGER
        },
        level_id:{
            type: DataTypes.INTEGER
        }
        
    },
    {
        tableName: 'test_has_level', 
        timestamps: false,
        uniqueKeys: {
            compositeKey: {
                fields: ['test_id', 'level_id']
            }
        }
    });
    testHasLevel.associate = models => { 
       testHasLevel.belongsTo(models.Test, { foreignKey: 'test_id', targetKey: 'test_id' });
       testHasLevel.belongsTo(models.Level, { foreignKey: 'level_id', targetKey: 'level_id' });
       testHasLevel.hasMany(models.Session, {foreignKey: 'testLevel_id', targetKey:'testLevel_id'}) 
    };
 
    return testHasLevel; 
} 