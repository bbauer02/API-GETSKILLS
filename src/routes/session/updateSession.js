const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessions/:session_id', isAuthenticated, isAuthorized, async (req, res) => {


        async function findSession() {
            try {

                const SessionFound = await models['Session'].findOne({
                    where: { session_id: req.params.session_id }
                });

                if (SessionFound === null) {
                    const message = `Session doesn't exist.Retry with an other session id.`;
                    return res.status(404).json({ message });
                }

                return SessionFound;

            } catch (error) {
                const message = `An error has occured finding the Session.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        async function updateSession(isValidate, session) {
            try {

                // Si la session est validée, on ne peut changer que les dates
                if (isValidate) {
                    delete req.body.session.validation;
                    delete req.body.session.test_id;
                    delete req.body.session.level_id;
                }

                await session.update(req.body.session, {
                    where: { session_id: req.params.session_id }
                });

                return session;

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

        async function updateAllSessionHasExam() {
            try {

                let sessionHasExamsForCreate = [];

                Object.values(req.body.examsForSessionCreate).map((exam, index) => {
                    sessionHasExamsForCreate[index] = {};
                    // exam_id
                    sessionHasExamsForCreate[index].sessionHasExam_id = exam.sessionHasExam_id;
                    // exam_id
                    sessionHasExamsForCreate[index].exam_id = exam.exam_id;
                    // session_id
                    sessionHasExamsForCreate[index].session_id = exam.session_id;
                    // user_id pour examinateur
                    sessionHasExamsForCreate[index].user_id = exam.user_id;
                    // adresse de l'épreuve
                    sessionHasExamsForCreate[index].adressExam = exam.adressExam;
                    // date et heure de l'épreuve
                    sessionHasExamsForCreate[index].DateTime = exam.DateTime;
                });

                await models['sessionHasExam'].bulkCreate(sessionHasExamsForCreate, { 
                    updateOnDuplicate: [
                        "user_id",
                        "adressExam",
                        "DateTime"
                    ] 
                });

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

            const sessionFound = await findSession();
            const updatedSession = await updateSession(sessionFound.dataValues.validation, sessionFound);
            await updateAllSessionHasExam();


            const message = `Session id:${updatedSession.session_id} and all linked sessionHAsExam have been updated `;
            res.json({ message, data: updatedSession });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }
    });
}