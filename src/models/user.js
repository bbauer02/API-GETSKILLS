module.exports = (sequelize, DataTypes) => {
    const User =  sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate : {
                notEmpty:{msg: `User:Role_id cannot be empty !`}
            }
        },
        login: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Login cannot be empty !`},
                notNull: {msg: `User:Login cannot be NULL!`}
            },
            unique: {
                args : true,
                msg: 'User:Login already exist!'
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Password cannot be empty !`},
                notNull: {msg: `User:Password cannot be NULL!`}
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Email cannot be empty !`},
                notNull: {msg: `User:Email cannot be NULL!`}
            },
            unique: {
                args : true,
                msg: 'User:Email already exist!'
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull:true
        },
        civility : {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:civility cannot be empty !`},
                notNull: {msg: `User:civility cannot be NULL!`}
            }
        },
        gender : {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Gender cannot be empty !`},
                notNull: {msg: `User:Gender cannot be NULL!`}
            }
        },
        firstname : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Firstname cannot be empty !`},
                notNull: {msg: `User:Firstname cannot be NULL!`}
            }
        },
        lastname : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Lastname cannot be empty !`},
                notNull: {msg: `User:Lastname cannot be NULL!`}
            }
        },
        adress1 : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Adress1 cannot be empty !`},
                notNull: {msg: `User:Adress1 cannot be NULL!`}
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
                notEmpty:{msg: `User:Zipcode cannot be empty !`},
                notNull: {msg: `User:Zipcode cannot be NULL!`}
            }
        },
        city : {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:City cannot be empty !`},
                notNull: {msg: `User:City cannot be NULL!`}
            },
            set(value) {
                this.setDataValue('city', value.toUpperCase());
            }
        },
        country_id: {
            type: DataTypes.INTEGER,
            allowNull:true,
            validate : {
                notEmpty:{msg: `User:Country_id cannot be empty !`}
            }
            
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:birthday cannot be empty !`},
                notNull: {msg: `User:birthday cannot be NULL!`}
            }
        },
        nationality_id: {
            type: DataTypes.INTEGER,
            allowNull:true,
            validate : {
                notEmpty:{msg: `User:Nationality_id cannot be empty !`}
            }
        },
        firstlanguage_id: {
            type: DataTypes.INTEGER,
            allowNull:true,
            validate : {
                notEmpty:{msg: `User:Firstlanguage_id cannot be empty !`}
            }
        }
    }, 
    {
        tableName: 'users',
        timestamps: false
    });
    User.associate = models => {
        User.belongsTo(models.Role,{foreignKey:'role_id',sourceKey: 'role_id', timestamps: false, onDelete:'SET NULL'});
        User.belongsTo(models.Country,{as: 'country',foreignKey:'country_id',sourceKey: 'country_id', timestamps: false,onDelete:'SET NULL'});
        User.belongsTo(models.Country,{as: 'nationality',foreignKey:'nationality_id',sourceKey: 'country_id', timestamps: false,onDelete:'SET NULL'});
        User.belongsTo(models.Country,{as: 'firstlanguage',foreignKey:'firstlanguage_id',sourceKey: 'country_id', timestamps: false,onDelete:'SET NULL'});
        User.belongsToMany(models.Institut, {through:models.institutHasUser,foreignKey:'user_id', otherKey:'institut_id',timestamps: false });
 
        User.hasMany(models.sessionHasUser,{foreignKey:'user_id', targetKey:'user_id'})
 


    }
    return User;
}  