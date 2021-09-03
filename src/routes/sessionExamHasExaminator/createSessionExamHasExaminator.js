const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessionexams/:session_has_exam_id/sessionexamexaminators', 
    isAuthenticated, isAuthorized, async (req, res) => {

        async function createSessionExamHasExaminator() {
            try {

                delete req.body.sessionExamHasExaminator_id;
            
                const SessionExamHasExaminatorCreated = await models['sessionExamHasExaminator'].create(req.body);
                return SessionExamHasExaminatorCreated;

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the sessionHasExam.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {

            const SessionExamHasExaminatorCreated = await createSessionExamHasExaminator();
            const message = `SessionHasExam with id ${SessionExamHasExaminatorCreated.sessionExamHasExaminator_id} has been created !`;
            res.json({ message, data: SessionExamHasExaminatorCreated });

        } catch (error) {
            const message = `An error has occured.`;
            return res.status(500).json({ message, data: error.message })
        }
    }
    );
}
