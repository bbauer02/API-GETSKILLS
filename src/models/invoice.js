module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('Invoice', {
            invoice_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            institut_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            session_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            session: {
                type: DataTypes.STRING,
                allowNull: false,
            },
           
            customerFirstname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerLastname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerAddress1: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customerAddress2: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customerCity: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerZipCode: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerCountry: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerEmail: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerPhone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            ref_client: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ref_invoice: {
                type: DataTypes.STRING,
                allowNull: false
            },
            test: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            level: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
            dueDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
        },
        {
            tableName: 'invoice',
            timestamps: false
        }
    );
    Invoice.addScope('amount_ttc', {
        attributes: {
            include: [
                [
                  sequelize.literal('(SELECT SUM(price_ht + (price_ht * tva / 100)) FROM `invoice_lines` WHERE `invoice_id` = `invoice`.`invoice_id`)'),
                  'amount_ttc'
                ],
              ],
        }
    });
    Invoice.associate = models => {
        Invoice.belongsTo(models.Institut, {foreignKey: 'institut_id', sourceKey: 'institut_id'});
        Invoice.hasMany(models.InvoiceLines, {as: 'lines', foreignKey: 'invoice_id', sourceKey: 'invoice_id'});


        Invoice.belongsTo(models.User, {foreignKey: 'user_id', sourceKey: 'user_id', onDelete: 'NO ACTION'});
        Invoice.belongsTo(models.Session, {foreignKey: 'session_id', sourceKey: 'session_id'});
    }
    return Invoice;
}