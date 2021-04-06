module.exports = (sequelize, DataTypes) => {
    const Test =  sequelize.define('Test', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
        },
        isInternal: {
            type:DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull:false
        },
        parent_id : {
            type:DataTypes.INTEGER,
            defaultValue:null,
            allowNull:true
        }
    },
    {
        tableName: 'tests',
        timestamps: false,
    });

    Test.associate = models => {
        Test.belongsToMany(models.Level, {through:models.testHasLevel,foreignKey:'test_id', otherKey:'level_id',timestamps: false });
        Test.hasMany(models.Test, {foreignKey:'parent_id', as: 'children'})

    }

        return Test;
} 