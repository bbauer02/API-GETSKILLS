const { models  } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get("/api/subjects", isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const { test_id, level_id, title } = req.query;

            let filters = {};
            if (test_id) filters.test_id = test_id;
            if (level_id) filters.level_id = level_id;
            if (title) filters.title = { [Op.like]: `%${title}%` };

            const subjects = await models.Subject.findAll({
                where: filters,
                attributes: [
                    "subject_id", "title", "description", "test_id", "level_id",
                    [Sequelize.fn("COUNT", Sequelize.col("questions.question_id")), "questionCount"],
                    [Sequelize.fn("SUM", Sequelize.col("questions.points")), "totalPoints"],
                    [Sequelize.fn("SUM", Sequelize.col("questions.duration")), "totalDuration"],
                ],
                include: [
                    { model: models.Test, as: "test", attributes: ["test_id", "label"] },
                    { model: models.Level, as: "level", attributes: ["level_id", "label"] },
                    {
                        model: models.Question,
                        as: "questions",
                        attributes: [],
                        through: { attributes: [] },
                    }
                ],
                group: ["Subject.subject_id", "test.test_id", "test.label", "level.level_id", "level.label"],
                order: [["test_id", "ASC"], ["level_id", "ASC"]],
                indexes: [
                    { fields: ["test_id"] },
                    { fields: ["level_id"] },
                    { fields: ["test_id", "level_id"] },
                    { fields: ["subject_id", "question_id"] }
                ]
            });

            const message = `${subjects.length} Subject(s) found`;
            res.json({ message, subjects });
        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des sujets", details: error.message });
        }
    });
};
