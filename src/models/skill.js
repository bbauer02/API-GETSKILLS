module.exports = (sequelize, DataTypes) => {
    const Skill =  sequelize.define('Skill', {
        skill_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull:false,
            validate : {
                notEmpty:{msg: `skill:label cannot be empty!`},
                notNull: {msg: `skill:label cannot be NULL!`}
            }
        },
        parent_id : {
            type:DataTypes.INTEGER,
            defaultValue:null,
            allowNull:true
        },
        isArchive : {
            type:DataTypes.BOOLEAN,
            defaultValue:false,
            allowNull:false,
            validate : {
                notEmpty:{msg: `Skill:isArchive cannot be empty!`},
                notNull: {msg: `Skill:isArchive cannot be NULL!`}
            }
        }
    },
    {
        tableName: 'skills',
        timestamps: false,
    });

    Skill.associate = models => {
        Skill.hasMany(models.Skill, { as: "child",foreignKey:'parent_id',sourceKey: 'skill_id',onDelete: 'CASCADE', hooks: true});
        Skill.belongsTo(models.Skill, {as:"parent",foreignKey:'parent_id'});
    }
        return Skill;
}   