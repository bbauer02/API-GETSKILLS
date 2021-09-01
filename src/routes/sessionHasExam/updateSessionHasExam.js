const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessions/:session_id/exams/:exam_id', isAuthenticated, isAuthorized, async (req, res) => {

        // Check si le sessionHasExam existe
        async function findSessionHasExam() {
            try {

                const SessionHasExamFound = await models['sessionHasExam'].findOne({
                    where: {
                        session_id: req.params.session_id,
                        exam_id: req.params.exam_id
                    }
                });

                if (SessionHasExamFound === null) {
                    const message = `sessionHasExam doesn't exist.Retry with an other sessionHasExam id.`;
                    return res.status(404).json({ message });
                }

                return SessionHasExamFound;

            } catch (error) {
                const message = `An error has occured finding the sessionHasExam.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // Check si la session est validée
        async function checkSessionValidation() {
            try {

                const session = await models['Session'].findOne({
                    where: { session_id: req.body.session_id }
                });

                if (session === null) {
                    const message = `session doesn't exist. Retry with an other session id.`;
                    return res.status(404).json({ message });
                } else {
                    return session.dataValues.validation;
                }

            } catch (error) {
                const message = `An error has occured checking the session validation.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        try {
            const SessionHasExamFound = await findSessionHasExam();
            const sessionIsValidate = await checkSessionValidation();

            // Si la session est validée, on ne peut changer les dates et lieux
            if (sessionIsValidate === true) {
                delete SessionHasExamFound.dataValues.DateTime;
                delete SessionHasExamFound.dataValues.adressExam;
            }

            await SessionHasExamFound.update(req.body, {
                where: {
                    session_id: req.params.session_id,
                    exam_id: req.params.exam_id
                }
            });

            const message = `sessionHasExam id:${SessionHasExamFound.sessionHasExam_id} has been updated `;
            res.json({ message, data: SessionHasExamFound });
        }

        catch (error) {
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }
    });
}