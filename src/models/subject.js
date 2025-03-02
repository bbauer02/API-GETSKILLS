module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define("Subject", {
        subject_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        test_id: {  // 🔥 Ajout d'un champ pour lier un sujet à un test
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Tests", key: "test_id" },
        },
        level_id: { // 🔥 Ajout d'un champ pour lier un sujet à un niveau
            type: DataTypes.INTEGER,
            allowNull: true, // Certains sujets peuvent être génériques (sans niveau spécifique)
            references: { model: "Levels", key: "level_id" },
        }
    }, {
        tableName: "subjects", // 🔥 Force Sequelize à utiliser exactement "subjects" et pas "Subjects"
        timestamps: false, // Désactive les colonnes createdAt et updatedAt si elles n'existent pas
    });

    Subject.associate = (models) => {
        Subject.hasMany(models.sessionHasExam, { foreignKey: "subject_id", as: "sessionExams" });

        Subject.belongsToMany(models.Question, {
            through: models.SubjectHasQuestion,
            foreignKey: "subject_id",
            otherKey: "question_id",
            as: "questions",
        });

        // 🔥 Ajout de la relation avec Test et Level
        Subject.belongsTo(models.Test, { foreignKey: "test_id", as: "test" });
        Subject.belongsTo(models.Level, { foreignKey: "level_id", as: "level" });
    };

    return Subject;
};
