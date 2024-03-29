module.exports = (sequelize, DataTypes) => {
    const Institut = sequelize.define('Institut', {
        institut_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: `Institut:label cannot be empty !` },
                notNull: { msg: `Institut:label cannot be NULL!` }
            },
            unique: {
                args: true,
                msg: 'Institut:Label already exist!'
            }
        },
        adress1: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: `Institut:Adress1 cannot be empty !` },
                notNull: { msg: `Institut:Adress1 cannot be NULL!` }
            }
        },
        adress2: {
            type: DataTypes.STRING,
            allowNull: true
        },
        zipcode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: `Institut:Zipcode cannot be empty !` },
                notNull: { msg: `Institut:Zipcode cannot be NULL!` }
            }
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: `Institut:City cannot be empty !` },
                notNull: { msg: `Institut:City cannot be NULL!` }
            },
            set(value) {
                this.setDataValue('city', value.toUpperCase());
            }
        },
        country_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg: `Institut:Country_id cannot be empty !` },
                notNull: { msg: `Institut:Country_id cannot be NULL!` }
            }

        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: `Institut:Email cannot be empty !` },
                notNull: { msg: `Institut:Email cannot be NULL!` }
            },
            unique: {
                args: true,
                msg: 'Institut:Email already exist!'
            }
        },
        siteweb: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        socialNetwork: {
            type: DataTypes.JSON ,
            allowNull: true
        },
        stripeId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        stripeActivated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false        
        },
    },
        {
            tableName: 'instituts',
            timestamps: false
        });

    Institut.associate = models => {
        Institut.belongsTo(models.Country, {
            as: 'institutCountry',
            foreignKey: 'country_id',
            sourceKey: 'country_id',
            timestamps: false
        });
        Institut.hasMany(models.institutHasUser, {
            foreignKey: 'institut_id',
            sourceKey: 'institut_id',
            onDelete: 'CASCADE'
        })
        Institut.hasMany(models.Session, { foreignKey: 'institut_id', sourceKey: 'institut_id', onDelete: 'CASCADE' })
        Institut.hasMany(models.InstitutHasPrices, { foreignKey: 'institut_id', sourceKey: 'institut_id', onDelete:'CASCADE' })
        Institut.hasMany(models.empowermentTests, { foreignKey: 'institut_id', sourceKey: 'institut_id', onDelete:'CASCADE' });
        Institut.hasMany(models.institutHasUser,{as:'users',foreignKey:'institut_id', sourceKey:'institut_id'});
        Institut.hasMany(models['Invoice'], { as: 'invoices', foreignKey: 'institut_id', sourceKey: 'institut_id', onDelete:'CASCADE' });
    }
    return Institut;
}