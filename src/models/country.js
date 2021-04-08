module.exports = (sequelize, DataTypes) => {
    const Country =  sequelize.define('Country', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true 
        },
        country: {
            type: DataTypes.STRING
        }
    },
    {
        tableName: 'countries',
        timestamps: false
    });

    Country.associate = models => {
        Country.hasMany(models.Language,{foreignKey:'country_id', sourceKey: 'id'});
    }
    return Country;
} 