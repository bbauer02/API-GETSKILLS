// Supprimez cette ligne ou utilisez-la uniquement pour les hooks
// const {models} = require("./index");

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
            }
        },
        {
            tableName: 'skills',
            timestamps: false,
            hooks: {
                beforeDestroy (instance, options) {
                    // Utilisez le models directement passé à la fonction associate
                    // au lieu de l'importer en haut du fichier
                    sequelize.models.SkillsHist.create(instance.dataValues);
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
    
    Skill.associate = models => {
        Skill.belongsTo(models.Test, { foreignKey: 'test_id', targetKey: 'test_id', as: 'test'});
        
        // Ajouter cette nouvelle relation avec Exam
        Skill.belongsToMany(models.Exam, {
            through: models.ExamHasSkill,
            foreignKey: 'skill_id',
            otherKey: 'exam_id',
            as: 'exams'
        });
    }

    return Skill;
}