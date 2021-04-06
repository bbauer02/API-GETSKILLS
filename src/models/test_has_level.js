module.exports = (sequelize, DataTypes) => {
    const testHasLevel =  sequelize.define('testHasLevel', {},
    {
        tableName: 'test_has_level',
        timestamps: false,
    });

 
    return testHasLevel;
}