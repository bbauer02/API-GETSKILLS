module.exports = (sequelize) => {
    const institutHasUser =  sequelize.define('institutHasUser', {},
    {
        tableName: 'institut_has_user',
        timestamps: false,
        uniqueKeys: {
            Items_unique: {
                fields: ['user_id', 'institut_id']
            }
        }
    });
    institutHasUser.associate = models => {
        institutHasUser.belongsTo(models.User, { foreignKey: 'user_id', sourceKey: 'user_id' });
        institutHasUser.belongsTo(models.Institut, { foreignKey: 'institut_id', sourceKey: 'institut_id' });
        institutHasUser.belongsTo(models.Role,{foreignKey:'role_id'});
    }
    return institutHasUser; 
} 