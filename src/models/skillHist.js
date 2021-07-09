module.exports = (sequelize, DataTypes) => {
    const SkillsHist = sequelize.define('SkillsHist', {
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
            tableName: 'skills_hist',
            timestamps: false,
        }
    );

    return SkillsHist;

}   