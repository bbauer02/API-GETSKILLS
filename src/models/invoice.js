const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('invoice', {
        invoice_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        institut_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        ref_client: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
        {
            tableName: 'invoice',
            timestamps: false
        }
    );
    Invoice.associate = models => {
        Invoice.belongsTo(models.Institut, {foreignKey: 'institut_id'});
        Invoice.hasMany(models.InvoiceLines, {as: 'lines', foreignKey: 'invoice_id'});
    }
    return Invoice;
}