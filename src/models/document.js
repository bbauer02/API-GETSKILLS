module.exports = (sequelize, DataTypes) => {
    const Docs = sequelize.define('Documents', {
            document_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            institut_id: {
                type: DataTypes.INTEGER,
            },
            filename: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {msg: `filename cannot be empty !`},
                    notNull: {msg: `filename cannot be NULL!`}
                }
            },
            filepath: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {msg: `filepath cannot be empty !`},
                    notNull: {msg: `filepath cannot be NULL!`}
                }
            },
            doctype: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            tableName: 'documents',
            timestamps: true
        });

    Docs.associate = models => {
        Docs.belongsTo(models.Institut, {foreignKey: 'institut_id'});
    };

    return Docs;
}