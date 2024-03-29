﻿const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessionexams/:session_has_exam_id/sessionexamexaminators',
        isAuthenticated, isAuthorized, async (req, res) => {
            try {
                const parameters = {};
                parameters.where = {
                    sessionHasExam_id: req.params.session_has_exam_id
                };

                parameters.include =
                    [{
                        model: models['sessionHasExam'],
                        include: [{
                            model: models['Session']
                        },
                        {
                            model: models['Exam']
                        }]
                    },
                    {
                        model: models['sessionUser'],
                        include: [{
                            model: models['sessionUserOption']
                        },
                        {
                            model: models['User']
                        }]
                    }];

                const SessionExamHasExaminatorBySessionExam = await models['sessionExamHasExaminator'].findAll(parameters);
                const message = `${SessionExamHasExaminatorBySessionExam.length} SessionExamHasExaminatorBySessionExams found`;
                res.json({ message, data: SessionExamHasExaminatorBySessionExam });
            }
            catch (error) {
                const message = `Service not available. Please retry later.`;
                res.status(500).json({ message, data: error.toString() });
            }
        });
}