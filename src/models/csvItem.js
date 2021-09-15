const { models } = require("./index");
module.exports = (sequelize, DataTypes) => {
    const csvItem = sequelize.define('csvItem', {
        csvItem_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        field: {
            type: DataTypes.STRING,
            allowNull: false
        },
        label: {
            type: DataTypes.STRING,
            allowNull: true
        },
        inLine: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        test_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
        {
            tableName: 'csv_items',
            timestamps: false
        });

    csvItem.associate = models => {
        csvItem.belongsTo(models.Test, {
            foreignKey: 'test_id',
            sourceKey: 'test_id',
            onDelete: 'CASCADE'
        });
    };

    return csvItem;
}
