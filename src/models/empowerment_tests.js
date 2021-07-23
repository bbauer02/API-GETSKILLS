const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const empowermentTests = sequelize.define('empowermentTests', {
        empowermentTests_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        institut_id: {
            type: DataTypes.INTEGER,
        },
        test_id: {
            type: DataTypes.INTEGER,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'empowerment_tests',
        timestamps: false
    });

    return empowermentTests;
}