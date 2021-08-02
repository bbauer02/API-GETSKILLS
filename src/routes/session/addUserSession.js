const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const asyncLib = require('async');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/sessions/users', isAuthenticated, isAuthorized, async (req, res) => {

        asyncLib.waterfall([



            function (done) {
                // 0 - Check si assez de place dans la session
                models['Session'].findOne({
                    where: { session_id: req.body.session.session_id },
                    include: {
                        model: models['sessionUser'],
                        as: "sessionUsers",
                        attributes: ['user_id']
                    }
                }).then(function (session) {
                    if (session === null) {
                        const message = `session doesn't exist. Retry with an other session id.`;
                        return res.status(404).json({ message });
                    } else if (session.dataValues.sessionUsers.length + 1 > session.dataValues.placeAvailable) {
                        const message = `session is full!`;
                        return res.status(500).json({ message });
                    } else {
                        done(null, session)
                    }
                }).catch(function (error) {
                    const message = `An error has occured finding the session.`;
                    return res.status(500).json({ message, data: error.message })
                });
            },





            function (session, done) {

                // 1 - initialiser les parameters pour trouver les exams
                const parameters = {};
                parameters.where = {};


                // 2 - trouver les exams depuis test id et level id(si pas null) depuis le req.body
                const test = parseInt(req.body.session.test_id);
                parameters.where.test_id = test;

                if (req.body.session.level_id !== null) {
                    const level = parseInt(req.body.session.level_id);
                    parameters.where.level_id = level;
                }
                models['Exam'].findAndCountAll(parameters)
                    .then(function (Exams) {
                        done(null, session, Exams)
                    })
                    .catch(function (error) {
                        const message = `An error has occured finding the exams.`;
                        return res.status(500).json({ message, data: error.message })
                    });
            },




            function (session, Exams, done) {

                // 3 - Créer le sessionUser req.body = object avec values et session
                models['sessionUser'].create(req.body.values)
                    .then(function (sessionUser) {
                        done(null, session, Exams, sessionUser)
                    })
                    .catch(function (error) {
                        const message = `An error has occured creating the sessionUser.`;
                        return res.status(500).json({ message, data: error.message })
                    });
            },




            function (session, Exams, sessionUser, done) {

                // 4 - créer l'object pour le bulk
                let sessionUsersOptionsForCreate = [];
                Exams.rows.forEach((exam, index) => {
                    sessionUsersOptionsForCreate[index] = {};
                    sessionUsersOptionsForCreate[index].exam_id = exam.dataValues.exam_id;
                    sessionUsersOptionsForCreate[index].isCandidate = exam.dataValues.isOption === true ? false : true;
                    sessionUsersOptionsForCreate[index].sessionUser_id = sessionUser.dataValues.sessionUser_id;
                })


                // 5 - post les sessionsUserOptions en bulk
                models['sessionUserOption'].bulkCreate(sessionUsersOptionsForCreate)
                    .then(function (sessionUserOptions) {
                        done(null, session, Exams, sessionUser, sessionUserOptions);
                        const message = `User id: ${sessionUser.dataValues.user_id} has been added in the session id : ${sessionUser.dataValues.session_id}.`;
                        res.json({ message, data: sessionUser });
                    })
                    .catch(function (error) {
                        const message = `An error has occured creating the options.`;
                        return res.status(500).json({ message, data: error.message })
                    });

            }
        ]
        )
    }
    )
}
