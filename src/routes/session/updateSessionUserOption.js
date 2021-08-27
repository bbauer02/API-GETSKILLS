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
                    return true;
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

            } catch (error) {
                const message = `An error has occured finding the sessionUserOption.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {
            await checkSessionValidation();
            const sessionUserOption = await checkSessionUserOption();

            delete req.body.sessionUser_id;
            delete req.body.option_id;
            delete req.body.exam_id;

            await sessionUserOption.update(req.body, {
                where: {
                    sessionUser_id: req.params.sessionUser_id,
                    exam_id: req.params.exam_id,
                    option_id: req.params.option_id
                }
            });
            const message = `The sessionUserOption session has been updated `;
            res.json({ message, data: sessionUserOption });
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