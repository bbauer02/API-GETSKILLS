const {models} = require("./index");
module.exports = (sequelize, DataTypes) => {
    const Skill = sequelize.define('Skill', {
            skill_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            label: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {msg: `skill:label cannot be empty!`},
                    notNull: {msg: `skill:label cannot be NULL!`}
                }
            },
            parent_id: {
                type: DataTypes.INTEGER,
                defaultValue: null,
                allowNull: true
            },
        },
        {
            tableName: 'skills',
            timestamps: false,
            hooks: {
                beforeDestroy (instance, options) {
                    console.log(instance.dataValues);
                    models['SkillsHist'].create(instance.dataValues);
                }
            }
        });

    Skill.hasMany(Skill, {
        as: "child",
        foreignKey: 'parent_id',
        sourceKey: 'skill_id',
        onDelete: 'CASCADE',
        hooks: true,
    });

    Skill.belongsTo(Skill, {as: "parent", foreignKey: 'parent_id', onDelete: 'CASCADE', hooks: true});

    return Skill;
}   