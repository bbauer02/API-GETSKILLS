module.exports = (sequelize, DataTypes) => {
    const Language =  sequelize.define('Language', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        country_id : {
            type: DataTypes.INTEGER
        },
        language: {
            type: DataTypes.STRING
        }

    },
    {
        tableName: 'languages',
        timestamps: false
    });

    Language.associate = models => {
        Language.belongsTo(models.Country,{foreignKey:'country_id', targetKey: 'id'});
    }
    return Language;
} 