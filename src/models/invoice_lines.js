const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const InvoiceLines = sequelize.define('InvoiceLines', {
        line_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        invoice_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        num_line: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price_ttc: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        tva: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    },
        {
            tableName: 'invoice_lines',
            timestamps: false
        }
    );
    InvoiceLines.associate = models => {
        InvoiceLines.belongsTo(models['invoice'], {foreignKey: 'invoice_id'});
    }
    return InvoiceLines;
}