module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('Invoice', {
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
        },
        test: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price_total_TTC: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    },
        {
            tableName: 'invoice',
            timestamps: true
        }
    );
    Invoice.associate = models => {
        Invoice.belongsTo(models.Institut, {foreignKey: 'institut_id', sourceKey: 'institut_id'});
        Invoice.hasMany(models.InvoiceLines, {as: 'lines', foreignKey: 'invoice_id', sourceKey: 'invoice_id'});
    }
    return Invoice;
}