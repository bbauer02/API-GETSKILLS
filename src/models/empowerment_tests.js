module.exports = (sequelize, DataTypes) => {

    // certification pour examinateur
    const empowermentTests = sequelize.define('empowermentTests', {
        empowermentTest_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        institut_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        test_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'empowerment_tests',
        timestamps: false,
        uniqueKeys: {
            compositeKey: {
                fields: ['test_id', 'user_id', 'institut_id']
            }
        }
    });

    empowermentTests.associate = models => { 
        empowermentTests.belongsTo(models.Institut,{foreignKey:'institut_id', sourceKey:'institut_id' });
        empowermentTests.belongsTo(models.Test,{foreignKey:'test_id', sourceKey:'test_id'});
        empowermentTests.belongsTo(models.User,{foreignKey:'user_id', sourceKey:'user_id'});
    };

    return empowermentTests;
}