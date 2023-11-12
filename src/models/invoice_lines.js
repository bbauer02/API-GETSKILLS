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
        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price_HT: {
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
    InvoiceLines.addScope('price_ttc', {
        attributes: {
            include: [
                [sequelize.literal('price_HT + price_HT * (tva / 100)'), 'price_TTC']
            ]
        }
    });
    InvoiceLines.associate = models => {
        InvoiceLines.belongsTo(models['Invoice'], {as: 'lines', foreignKey: 'invoice_id', sourceKey: 'invoice_id'});
    }
    return InvoiceLines;
}