const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions', isAuthenticated, isAuthorized, async (req, res) => {

        async function createSession() {
            try {

                // Ici le req.body contient deux objects, un avec les infos de la session
                // et un autre contenant toutes les info des sessionHasUser (adresse et heure épreuves)
                // req.body.session et req.body.examsForSessionCreate
                const SessionCreated = await models['Session'].create(req.body.session);
                return SessionCreated;

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the Session.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // unused
        /*
        async function findAllSessionExams() {
            try {

                const parameters = {};
                parameters.where = {};

                const test = parseInt(req.body.session[0].test_id);
                parameters.where.test_id = test;

                if (req.body.level_id !== null) {
                    const level = parseInt(req.body.session[0].level_id);
                    parameters.where.level_id = level;
                }
                const allExamsFromSession = await models['Exam'].findAndCountAll(parameters);
                return allExamsFromSession;

            } catch (error) {
                const message = `An error has occured finding the exams.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
        */

        // Unused et pas fonctionnel
        // Check le role des users_id si > 1 pour être examinateur
        /*
        async function checkAllExaminatorForEachExam() {
            try {

                const parameters = {};

                req.body.sessionHasExams.forEach((sessionHasExam) => {

                    parameters.where = {
                        user_id: sessionHasExam.user_id
                    };

                    parameters.include = [{
                        model: models['institutHasUser'],
                        where: {
                            institut_id: req.params.institut_id,
                            user_id: sessionHasExam.user_id
                        },
                        include: [
                            {
                                model: models['Role']
                            }
                        ]
                    }];

                    const examinatorFound = await models['User'].findOne(parameters);

                    if (examinatorFound === null) {
                        const message = `One of the examinator doesn't exist. Retry with another user_id.`;
                        return res.status(404).json({ message });
                    }

                    // On vérifie si le user trouvé est bien au moins professeur
                    if (examinatorFound.dataValues.institutHasUser.Role.power < 2) {
                        const message = `One of the examinator has not enought power. Retry with another user_id.`;
                        return res.status(404).json({ message });
                    }
                });

            } catch (error) {
                const message = `An error has occured finding the exams.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
        */

        async function postAllSessionHasExam(_sessionCreated) {
            try {

                let sessionHasExamsForCreate = [];

                Object.values(req.body.examsForSessionCreate).map((exam, index) => {
                    sessionHasExamsForCreate[index] = {};
                    // exam_id
                    sessionHasExamsForCreate[index].exam_id = exam.exam_id;
                    // user_id pour examinateur
                    sessionHasExamsForCreate[index].user_id = exam.user_id;
                    // session_id
                    sessionHasExamsForCreate[index].session_id = _sessionCreated.dataValues.session_id;
                    // adresse de l'épreuve
                    sessionHasExamsForCreate[index].adressExam = exam.adressExam;
                    // date et heure de l'épreuve
                    sessionHasExamsForCreate[index].DateTime = exam.DateTime;
                });

                await models['sessionHasExam'].bulkCreate(sessionHasExamsForCreate);

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the sessionHasExams.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {

            const sessionCreated = await createSession();
            // const allExamsFromSession = await findAllSessionExams();
            // await checkAllExaminatorForEachExam();
            await postAllSessionHasExam(sessionCreated);

            const message = `Session id : ${sessionCreated.dataValues.session_id} and all the sessionHasExam have been created.`;
            res.json({ message, data: sessionCreated })

        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }
    });
}
