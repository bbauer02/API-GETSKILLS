const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions', isAuthenticated, isAuthorized, async (req, res) => {

        async function createSession() {
            try {

                // Ici le req.body contient deux objects, un avec les infos de la session
                // et un autre contenant toutes les info des sessionHasUser (adresse et heure épreuves)
                // req.body.session et req.body.sessionHasExams
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

        async function postAllSessionHasExam() {
            try {

                let sessionHasExamsForCreate = [];
                req.body.sessionHasExams.forEach((exam, index) => {
                    sessionHasExamsForCreate[index] = {};
                    // exam_id
                    sessionHasExamsForCreate[index].exam_id = exam.exam_id;
                    // user_id pour examinateur
                    sessionHasExamsForCreate[index].user_id = exam.user_id;
                    // session_id
                    sessionHasExamsForCreate[index].session_id = exam.session_id;
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
            await postAllSessionHasExam();

            const message = `Session id : ${Session.session_id} and all the sessionHasExam have been created.`;
            res.json({ message, data: Session })

        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }
    });
}
