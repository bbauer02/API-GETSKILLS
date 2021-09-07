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
            allowNull: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        table: {
            type: DataTypes.STRING,
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
