module.exports = (sequelize, DataTypes) => {
    const Role =  sequelize.define('Role', {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type:DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Role:Label cannot be empty !`},
                notNull: {msg: `Role:Label cannot be NULL!`}
            }
        },
        power: {
            type:DataTypes.INTEGER,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Role:Power cannot be empty !`},
                notNull: {msg: `Role:Power cannot be NULL!`}
            }
        }
    },
    {
        tableName: 'roles',
        timestamps: false,
    });

    Role.associate = models => {
        Role.hasMany(models.institutHasUser, {foreignKey:'role_id',sourceKey: 'role_id'});
        Role.hasMany(models.User, {as:'systemRole',foreignKey:'systemRole_id',sourceKey: 'role_id'});
    } 
    return Role;
}  