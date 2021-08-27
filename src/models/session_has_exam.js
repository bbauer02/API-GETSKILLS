const { models } = require("./index");
module.exports = (sequelize, DataTypes) => {
    const sessionHasExam = sequelize.define('sessionHasExam', {
        sessionHasExam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        adressExam: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: `sessionHasExam : adressExam cannot be empty !` },
                notNull: { msg: `sessionHasExam : adressExam cannot be NULL!` }
            }
        },
        DateTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
        {
            tableName: 'session_has_exam',
            timestamps: false
        });

    sessionHasExam.associate = models => {
        sessionHasExam.belongsTo(models.Session, { foreignKey: 'session_id', sourceKey: 'session_id', onDelete: 'CASCADE' });
        sessionHasExam.belongsTo(models.Exam, { foreignKey: 'exam_id', sourceKey: 'exam_id' });
        sessionHasExam.belongsTo(models.institutHasUser, { foreignKey: 'user_id', sourceKey: 'user_id' });
    };

    return sessionHasExam;
}
