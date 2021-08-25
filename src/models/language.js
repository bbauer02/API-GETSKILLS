module.exports = (sequelize, DataTypes) => {
    const Language =  sequelize.define('Language', {
        firstlanguage_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type:DataTypes.STRING,
            allowNull: false,
            validate : {
                notEmpty:{msg: `Language:Label cannot be empty !`},
                notNull: {msg: `Language:Label cannot be NULL!`}
            }
        }
    },
    {
        tableName: 'languages',
        timestamps: false,
    });

    Language.associate = models => {
        Language.hasMany(models.User,{as: 'firstlanguage',foreignKey:'firstlanguage_id', timestamps: false});
    }
     return Language;
}