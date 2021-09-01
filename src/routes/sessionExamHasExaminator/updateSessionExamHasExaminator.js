const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessionexams/:session_has_exam_id/sessionexamexaminators/:session_exam_has_examinator_id', isAuthenticated, isAuthorized, async (req, res) => {

        async function findSessionExamHasExaminator() {
            try {

                const SessionExamHasExaminatorFound = await models['sessionExamHasExaminator'].findOne({
                    where: {
                        sessionHasExam_id: req.params.session_has_exam_id,
                        sessionExamHasExaminator_id: req.params.session_exam_has_examinator_id
                    }
                });

                if (SessionExamHasExaminatorFound === null) {
                    const message = `SessionExamHasExaminator doesn't exist.Retry with an other SessionExamHasExaminator id.`;
                    return res.status(404).json({ message });
                }

                return SessionExamHasExaminatorFound;

            } catch (error) {
                const message = `An error has occured finding the SessionExamHasExaminator.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {
            const SessionExamHasExaminatorFound = await findSessionExamHasExaminator();
                await SessionExamHasExaminatorFound.update(req.body, {
                    where: {
                        sessionExamHasExaminator_id: req.params.session_exam_has_examinator_id
                    }
                });

            const message = `SessionExamHasExaminator id:${SessionExamHasExaminatorFound.dataValues.sessionExamHasExaminator_id} has been updated `;
            res.json({ message, data: SessionExamHasExaminatorFound });
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