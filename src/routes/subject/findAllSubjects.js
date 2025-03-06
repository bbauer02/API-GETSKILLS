const { models  } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.get("/api/subjects", isAuthenticated, authorize, async (req, res) => {
        try {
            const { test_id, level_id, title } = req.query;
            const { userId, userInstituts, systemRole } = req.authContext;

            let filters = {};
            if (test_id) filters.test_id = test_id;
            if (level_id) filters.level_id = level_id;
            if (title) filters.title = { [Op.like]: `%${title}%` };

            // Définition des inclusions standard
            const standardIncludes = [
                { model: models.Level, as: "level", attributes: ["level_id", "label"] },
                {
                    model: models.Question,
                    as: "questions",
                    attributes: [],
                    through: { attributes: [] }
                }
            ];

            // Définition des attributs à récupérer
            const attributes = [
                "subject_id", "title", "description", "test_id", "level_id",
                [Sequelize.fn("COUNT", Sequelize.col("questions.question_id")), "questionCount"],
                [Sequelize.fn("SUM", Sequelize.col("questions.points")), "totalPoints"],
                [Sequelize.fn("SUM", Sequelize.col("questions.duration")), "totalDuration"],
            ];

            let subjects;

            // Si l'utilisateur est admin système (power = 10), il a accès à tous les sujets
            if (systemRole && systemRole.power === 10) {
                console.log("Utilisateur admin système: accès à tous les sujets");
                
                subjects = await models.Subject.findAll({
                    where: filters,
                    attributes: attributes,
                    include: [
                        { model: models.Test, as: "test", attributes: ["test_id", "label"] },
                        ...standardIncludes
                    ],
                    group: ["Subject.subject_id", "test.test_id", "test.label", "level.level_id", "level.label"],
                    order: [["test_id", "ASC"], ["level_id", "ASC"]]
                });
            } 
            // Sinon, l'utilisateur n'a accès qu'aux sujets des tests de ses instituts
            else {
                console.log("Utilisateur non-admin système: accès restreint aux instituts");
                
                // Vérifier si l'utilisateur appartient à au moins un institut
                if (!userInstituts || userInstituts.length === 0) {
                    return res.status(403).json({ 
                        message: "Vous n'appartenez à aucun institut et n'avez donc pas accès aux sujets" 
                    });
                }

                // Obtenir les IDs des instituts de l'utilisateur
                const institutIds = userInstituts.map(institut => institut.institut_id);
                console.log(`Instituts de l'utilisateur: ${institutIds.join(', ')}`);
                
                subjects = await models.Subject.findAll({
                    where: filters,
                    attributes: attributes,
                    include: [
                        {
                            model: models.Test,
                            as: "test",
                            attributes: ["test_id", "label", "owner_id"],
                            where: { owner_id: { [Op.in]: institutIds } }
                        },
                        ...standardIncludes
                    ],
                    group: ["Subject.subject_id", "test.test_id", "test.label", "test.owner_id", "level.level_id", "level.label"],
                    order: [["test_id", "ASC"], ["level_id", "ASC"]]
                });
            }

            const message = `${subjects.length} Sujet(s) trouvé(s)`;
            res.json({ message, subjects });
        } catch (error) {
            console.error("Erreur lors de la récupération des sujets:", error);
            res.status(500).json({ error: "Erreur lors de la récupération des sujets", details: error.message });
        }
    });
};
