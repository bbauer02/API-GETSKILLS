const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessionUsers/:sessionUser_id/exams/:exam_id/options/:option_id', isAuthenticated, isAuthorized, async (req, res) => {

        // Check si la session est validée
        async function checkSessionValidation() {
            try {

                const session = await models['Session'].findOne({
                    where: { session_id: req.body.session_id }
                });

                if (session === null) {
                    const message = `session doesn't exist. Retry with an other session id.`;
                    return res.status(404).json({ message });
                } else if (session.dataValues.validation === true) {
                    const message = `session is validate, can't update sessionUserOptions!`;
                    return res.status(500).json({ message });
                } else {
                    return session;
                }

            } catch (error) {
                const message = `An error has occured checking the session validation.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // Check si le sessionUserOption existe
        async function checkSessionUserOption() {
            try {

                const sessionUserOption = await models['sessionUserOption'].findOne({
                    where: {
                        sessionUser_id: req.params.sessionUser_id,
                        exam_id: req.params.exam_id,
                        option_id: req.params.option_id
                    }
                });

                if (sessionUserOption === null) {
                    const message = `The option doesn't exist.`;
                    return res.status(404).json({ message });
                }

                return sessionUserOption;

            } catch (error) {
                const message = `An error has occured finding the sessionUserOption.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // Check si l'exam existe
        async function findSessionExam(session) {
            try {

                const sessionExamFound = await models['sessionHasExam'].findOne({
                    where: {
                        exam_id: req.params.exam_id,
                        session_id: session.session_id
                    }
                })

                if (sessionExamFound === null) {
                    const message = `sessionExam doesn't exist.Retry with an other sessionExam id.`;
                    return res.status(404).json({ message });
                }

                return sessionExamFound;

            } catch (error) {
                const message = `An error has occured finding the sessionExam.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function createSessionExamHasExaminator(sessionExam) {
            try {

                const sessionExamHasExaminator = {
                    sessionUser_id: req.params.sessionUser_id,
                    sessionHasExam_id: sessionExam.sessionHasExam_id,
                    empowermentTest_id: null,
                }

                await models['sessionExamHasExaminator'].create(sessionExamHasExaminator);

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the sessionExamHasExaminator.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function findSessionExamHasExaminator(sessionExam) {
            try {

                const SessionExamHasExaminatorFound = await models['sessionExamHasExaminator'].findOne({
                    where: {
                        sessionUser_id: req.params.sessionUser_id,
                        sessionHasExam_id: sessionExam.dataValues.sessionHasExam_id
                    }
                });

                if (SessionExamHasExaminatorFound === null) {
                    const message = `SessionExamHasExaminator doesn't exist.Retry with an other SessionExamHasExaminatorFound id.`;
                    return res.status(404).json({ message });
                }

                return SessionExamHasExaminatorFound;

            } catch (error) {
                const message = `An error has occured finding the sessionExamHaxExaminator.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
        

        async function deleteSessionExamHasExaminator(sessionExamHasExaminator) {
            try {

                const SessionExamHasExaminatorFound = await models['sessionExamHasExaminator'].findOne({
                    where: {
                        sessionExamHasExaminator_id: sessionExamHasExaminator.dataValues.sessionExamHasExaminator_id
                    }
                });

                if (SessionExamHasExaminatorFound === null) {
                    const message = `SessionExamHasExaminator doesn't exist.Retry with an other SessionExamHasExaminatorFound id.`;
                    return res.status(404).json({ message });
                }

                await SessionExamHasExaminatorFound.destroy(
                    {
                        where:
                        {
                            sessionExamHasExaminator_id: sessionExamHasExaminator.dataValues.sessionExamHasExaminator_id
                        }
                    });

            } catch (error) {

                const message = `An error has occured deleting the sessionExamHasExaminator.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // On reprend toute les informations requise pour la slice
        async function findSessionUser() {
            try {
                const parameters = {};

                parameters.where = {
                    sessionUser_id: req.params.sessionUser_id
                };

                parameters.include = [{
                    model: models['sessionUserOption'],
                    include: [{
                        model: models['Exam']
                    }]
                }];

                const sessionUser = await models['sessionUser'].findOne(parameters);

                if (sessionUser === null) {
                    const message = `The sessionUser doesn't exist.`;
                    return res.status(404).json({ message });
                }

                return sessionUser;

            } catch (error) {
                const message = `An error has occured finding the sessionUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        try {
            const session = await checkSessionValidation();
            const sessionUserOptionFound = await checkSessionUserOption();

            // Si le candidat ne participe plus à une épreuve (isCandidate)
            // On supprime le sessionExamHasExaminator correspondant
            if (req.body.isCandidate === false && sessionUserOptionFound.dataValues.isCandidate === true) {
                const sessionExamFoundForDelete = await findSessionExam(session);
                const sessionExamHasExaminatorFound = await findSessionExamHasExaminator(sessionExamFoundForDelete)
                await deleteSessionExamHasExaminator(sessionExamHasExaminatorFound);
            }

            // A l'inverse, si un candidat s'inscrit à une épreuve optionnelle
            // On créer le sessionExamHasExaminator correspondant
            if (req.body.isCandidate === true && sessionUserOptionFound.dataValues.isCandidate === false) {
                const sessionExamFoundForCreate = await findSessionExam(session);
                await createSessionExamHasExaminator(sessionExamFoundForCreate)
            }

            await sessionUserOptionFound.update(req.body, {
                where: {
                    sessionUser_id: req.params.sessionUser_id,
                    exam_id: req.params.exam_id,
                    option_id: req.params.option_id
                }
            });

            const sessionUserUpdated = await findSessionUser();

            const message = `The sessionUser session has been updated `;
            res.json({ message, data: sessionUserUpdated });
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