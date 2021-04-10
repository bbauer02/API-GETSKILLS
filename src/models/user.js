module.exports = (sequelize, DataTypes) => {
    const User =  sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate : {
                notEmpty:{msg: `User:Role_id cannot be empty !`},
                notNull: {msg: `User:Role_id cannot be NULL!`}
            }
        },
        login: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Login cannot be empty !`},
                notNull: {msg: `User:Login cannot be NULL!`}
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
        genrer : {
            type: DataTypes.STRING,
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
            }
        },
        country_id: {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Country_id cannot be empty !`},
                notNull: {msg: `User:Country_id cannot be NULL!`}
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
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Nationality_id cannot be empty !`},
                notNull: {msg: `User:Nationality_id cannot be NULL!`}
            }
        },
        firstlanguage_id: {
            type: DataTypes.INTEGER,
            allowNull:false,
            validate : {
                notEmpty:{msg: `User:Firstlanguage_id cannot be empty !`},
                notNull: {msg: `User:Firstlanguage_id cannot be NULL!`}
            }
        }
    }, 
    {
        tableName: 'users',
        timestamps: false
    });
    User.associate = models => {
        User.belongsTo(models.Country,{foreignKey:'nationality_id',sourceKey: 'country_id', timestamps: false});
        User.belongsTo(models.Country,{foreignKey:'firstlanguage_id',sourceKey: 'country_id', timestamps: false});
        User.belongsTo(models.Country,{foreignKey:'country_id',sourceKey: 'country_id', timestamps: false});
        User.belongsTo(models.Country,{foreignKey:'role_id',sourceKey: 'country_id', timestamps: false});


    }
    return User;
}  