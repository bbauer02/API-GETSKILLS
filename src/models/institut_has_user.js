module.exports = (sequelize) => {
    const institutHasUser =  sequelize.define('institutHasUser', {},
    {
        tableName: 'institut_has_user',
        timestamps: false,
    });
    institutHasUser.associate = models => {
        institutHasUser.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'user_id' });
        institutHasUser.belongsTo(models.Institut, { foreignKey: 'institut_id', targetKey: 'institut_id' });
    }
    return institutHasUser; 
}