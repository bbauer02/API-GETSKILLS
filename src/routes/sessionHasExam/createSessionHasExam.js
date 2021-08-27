const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/exams', isAuthenticated, isAuthorized, async (req, res) => {


        async function createSessionHasExam() {
            try {

                const SessionHasExamCreated = await models['sessionHasExam'].create(req.body);
                return SessionHasExamCreated;

            } catch (error) {
                const message = `An error has occured creating the sessionHasExam.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {

            const SessionHasExamCreated = await createSessionHasExam();
            const message = `SessionHasExam with id ${SessionHasExamCreated.dataValues.sessionHasExam_id} has been created !`;
            res.json({ message, data: SessionHasExamCreated });

        } catch (error) {
            const message = `An error has occured.`;
            return res.status(500).json({ message, data: error.message })
        }
    }
    );
}
