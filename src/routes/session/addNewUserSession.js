const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const asyncLib = require('async');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
// TO DO add isAuthenticated & isAuthorized

module.exports = (app) => {
    app.post('/api/instituts/:idInstitut/sessions/:idSession/newUser', async (req, res) => {

        asyncLib.waterfall([
            function (done) {

                // 0 - Créer User
                const valuesForPostUser = { ...req.body };

                // useless?
                delete valuesForPostUser.hasPaid;
                delete valuesForPostUser.paymentMode;
                delete valuesForPostUser.passwordConfirmation;

                models['User'].create(valuesForPostUser)
                    .then(function (userCreated) {
                        done(null, userCreated)
                    })
                    .catch(function (error) {
                        const message = `An error has occured creating the User.`;
                        return res.status(500).json({ message, data: error.message })
                    });
            },



            function (userCreated, done) {

                // 1 - Post Institut has user
                const valuesForPostInstitutHasUser = {};
                valuesForPostInstitutHasUser.role_id = 1;
                valuesForPostInstitutHasUser.user_id = userCreated.dataValues.user_id;
                valuesForPostInstitutHasUser.institut_id = req.params.idInstitut;

                models['institutHasUser'].create(valuesForPostInstitutHasUser)
                    .then(function (institutHasUserCreated) {
                        done(null, userCreated, institutHasUserCreated)
                    })
                    .catch(function (error) {
                        const message = `An error has occured creating the institutUser.`;
                        return res.status(500).json({ message, data: error.message })
                    });
            },



            function (userCreated, institutHasUserCreated, done) {

                // 2 - Check si assez de place dans la session
                models['Session'].findOne({
                    where: { session_id: req.params.idSession },
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
                        done(null, userCreated, institutHasUserCreated, session)
                    }
                }).catch(function (error) {
                    const message = `An error has occured finding the session.`;
                    return res.status(500).json({ message, data: error.message })
                });
            },



            function (userCreated, institutHasUserCreated, session, done) {
                // 3 - initialiser les parameters pour trouver les exams
                const parameters = {};
                parameters.where = {};


                // 4 - trouver les exams depuis test id et level id(si pas null) depuis le req.body
                const test = parseInt(req.body.test_id);
                parameters.where.test_id = test;

                if (req.body.level_id !== null) {
                    const level = parseInt(req.body.level_id);
                    parameters.where.level_id = level;
                }
                models['Exam'].findAndCountAll(parameters)
                    .then(function (examsFound) {
                        done(null, userCreated, institutHasUserCreated, session, examsFound)
                    })
                    .catch(function (error) {
                        const message = `An error has occured finding the exams.`;
                        return res.status(500).json({ message, data: error.message })
                    })
            },




            function (userCreated, institutHasUserCreated, session, examsFound, done) {

                // 5 - Créer le sessionUser req.body = object avec values et session
                const valuesForPostSessionUser = {};
                valuesForPostSessionUser.user_id = userCreated.dataValues.user_id;
                valuesForPostSessionUser.session_id = req.params.idSession;
                valuesForPostSessionUser.hasPaid = req.body.hasPaid;
                valuesForPostSessionUser.paymentMode = req.body.paymentMode;

                models['sessionUser'].create(valuesForPostSessionUser)
                    .then(function (sessionUserCreated) {
                        done(null, userCreated, institutHasUserCreated, session, examsFound, sessionUserCreated)
                    }).catch(function (error) {
                        const message = `An error has occured creating the sessionUser.`;
                        return res.status(500).json({ message, data: error.message })
                    });
            },




            function ( userCreated, institutHasUserCreated, session, examsFound, sessionUserCreated, done) {

                // 6 - créer l'object pour le bulk
                let sessionUsersOptionsForCreate = [];
                examsFound.rows.forEach((exam, index) => {
                    sessionUsersOptionsForCreate[index] = {};
                    sessionUsersOptionsForCreate[index].exam_id = exam.dataValues.exam_id;
                    sessionUsersOptionsForCreate[index].isCandidate = exam.dataValues.isOption === true ? false : true;
                    sessionUsersOptionsForCreate[index].sessionUser_id = sessionUserCreated.dataValues.sessionUser_id;
                })


                // 7 - post les sessionsUserOptions en bulk
                models['sessionUserOption'].bulkCreate(sessionUsersOptionsForCreate)
                    .then(function (optionsCreated) {
                        done(null, userCreated, institutHasUserCreated, session, examsFound, sessionUserCreated, optionsCreated);
                        const message = `User id: ${userCreated.dataValues.user_id} has been added in the session id : ${session.dataValues.session_id}.`;
                        res.json({ message, data: optionsCreated });
                    }).catch(function (error) {
                        const message = `An error has occured creating the options.`;
                        return res.status(500).json({ message, data: error.message })
                    });
            }]

    );
})}
