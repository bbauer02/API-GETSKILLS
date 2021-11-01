module.exports = (sequelize, DataTypes) => {
    const Country =  sequelize.define('Country', {
        country_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type:DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Country:Label_fr cannot be empty !`},
                notNull: {msg: `Country:Label_fr cannot be NULL!`}
            }
        },
        countryNationality: {
            type:DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Country:Nationality cannot be empty !`},
                notNull: {msg: `Country:Nationality cannot be NULL!`}
            }
        },
        countryLanguage: {
            type:DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Country:Language cannot be empty !`},
                notNull: {msg: `Country:Language cannot be NULL!`}
            }
        },
        code: {
            type:DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Country:Code cannot be empty !`},
                notNull: {msg: `Country:Code cannot be NULL!`}
            }
        }
    },
    {
        tableName: 'countries',
        timestamps: false,
    });

    Country.associate = models => {
        Country.hasMany(models.Institut,{as: 'institutCountry',foreignKey:'country_id',sourceKey: 'country_id', timestamps: false});
        Country.hasMany(models.User,{as: 'country',foreignKey:'country_id',sourceKey: 'country_id', timestamps: false});
        Country.hasMany(models.User,{as: 'nationality',foreignKey:'nationality_id',sourceKey: 'country_id', timestamps: false});
        Country.hasMany(models.User,{as: 'nativeCountry',foreignKey:'nativeCountry_id',sourceKey: 'country_id', timestamps: false});
    
    }
     return Country;
}