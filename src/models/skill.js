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
            test_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {msg: `skill:test_id cannot be NULL!`}
                }
                // Suppression de defaultValue car incompatible avec allowNull: false
            }
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

    Skill.belongsTo(Skill, {as: "parent", foreignKey: 'parent_id', onDelete: 'NO ACTION', hooks: true});
    //Skill.hasMany(Question, {foreignKey: 'skill_id', sourceKey: 'skill_id'});
   
    Skill.associate = models => {
        Skill.hasMany(models.Question, {foreignKey: 'skill_id', targetKey: 'skill_id'});
        Skill.belongsTo(models.Test, { foreignKey: 'test_id',targetKey: 'test_id',as: 'test'});
    }

    return Skill;
}   