module.exports = (sequelize, DataTypes) => {
    const Institut =  sequelize.define('Institut', { 
        institut_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type:DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Institut:label cannot be empty !`},
                notNull: {msg: `Institut:label cannot be NULL!`}
            }
        },
        adress1 : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Institut:Adress1 cannot be empty !`},
                notNull: {msg: `Institut:Adress1 cannot be NULL!`}
            }
        },
        adress2 : {
            type: DataTypes.STRING,
            allowNull:true
        },
        zipcode : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Institut:Zipcode cannot be empty !`},
                notNull: {msg: `Institut:Zipcode cannot be NULL!`}
            }
        },
        city : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Institut:City cannot be empty !`},
                notNull: {msg: `Institut:City cannot be NULL!`}
            },
            set(value) {
                this.setDataValue('city', value.toUpperCase());
            }
        },
        country_id: {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Institut:Country_id cannot be empty !`},
                notNull: {msg: `Institut:Country_id cannot be NULL!`}
            }
            
        },
        email: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Institut:Email cannot be empty !`},
                notNull: {msg: `Institut:Email cannot be NULL!`}
            }
        },
        siteweb: {
            type: DataTypes.STRING,
            allowNull:true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull:true
        },
        socialNetwork: {
            type: DataTypes.STRING,
            allowNull:true,
            get() {
                return this.getDataValue('socialNetwork').split(';')
            },
            set(val) {
                this.setDataValue('socialNetwork',val.join(';'));
             }
        }
    },
    {
        tableName: 'instituts',
        timestamps: false
    });
    Institut.associate = models => {
        Institut.belongsToMany(models.User,  {through:models.institutHasUser,foreignKey:'user_id', otherKey:'institut_id',timestamps: false });
    }
    return Institut;
}
