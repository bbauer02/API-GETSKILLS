const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const { session, sessionHasExams} = req.body;
            const {dataValues : sessionCreated} = await models['Session'].create(session);
            const exams = sessionHasExams.filter((exam) => exam.examId !=="").map((exam, index) => {
                return {
                    adressExam: exam.adressExam,
                    room: exam.room,
                    DateTime: exam.DateTime,
                    session_id: sessionCreated.session_id,
                    exam_id: exam.examId
                }
            });
            await models['sessionHasExam'].bulkCreate(exams);
            const message = `Session id : ${sessionCreated.session_id} and all the sessionHasExam have been created.`;
            res.json({ message, session: sessionCreated })
        }
        catch (error) { 
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            const message = `An error has occured creating the Session.`;
            return res.status(500).json({ message, data: error.message })
        }
    });
}
