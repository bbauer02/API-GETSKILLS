const { models } = require("./index");
module.exports = (sequelize, DataTypes) => {
    const sessionExamHasExaminator = sequelize.define('sessionExamHasExaminator', {
        sessionExamHasExaminator_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sessionHasExam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg: `sessionHasExam : sessionHasExam_id cannot be empty !` }
            }
        },
        sessionUser_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: { msg: `sessionHasExam : sessionUser_id cannot be empty !` }
            }
        },
        empowermentTest_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },
        {
            tableName: 'session_exam_has_examinator',
            timestamps: false,
            uniqueKeys: {
                compositeKey: {
                    fields: ['sessionHasExam_id', 'sessionUser_id']
                }
            },
        });

    sessionExamHasExaminator.associate = models => {
        sessionExamHasExaminator.belongsTo(models.sessionHasExam, {
            foreignKey: 'sessionHasExam_id',
            sourceKey: 'sessionHasExam_id',
            onDelete: 'CASCADE'
        });

        sessionExamHasExaminator.belongsTo(models.sessionUser, {
            foreignKey: 'sessionUser_id',
            sourceKey: 'sessionUser_id',
            onDelete: 'CASCADE'
        });

        sessionExamHasExaminator.belongsTo(models.empowermentTests, {
            foreignKey: 'empowermentTest_id',
            sourceKey: 'empowermentTest_id',
            onDelete: 'SET NULL'
        });
    };

    return sessionExamHasExaminator;
}
