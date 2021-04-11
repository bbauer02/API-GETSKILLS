module.exports = (sequelize) => {
    const institutHasUser =  sequelize.define('institutHasUser', {},
    {
        tableName: 'institut_has_user',
        timestamps: false,
    });

 
    return institutHasUser;
}