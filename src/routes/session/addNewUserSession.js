const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:idSession/newUser', isAuthenticated, isAuthorized, async (req, res) => {


        async function createUser() {
            try {

                // 0 - Créer User
                const valuesForPostUser = { ...req.body };

                // useless?
                delete valuesForPostUser.hasPaid;
                delete valuesForPostUser.paymentMode;
                delete valuesForPostUser.passwordConfirmation;

                const userCreated = await models['User'].create(valuesForPostUser);
                return userCreated;

            } catch (error) {
                const message = `An error has occured creating the User.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function postInstitutHasUser(_userCreated) {
            try {

                // 1 - Post Institut has user
                const valuesForPostInstitutHasUser = {};
                valuesForPostInstitutHasUser.role_id = 1;
                valuesForPostInstitutHasUser.user_id = _userCreated.dataValues.user_id;
                valuesForPostInstitutHasUser.institut_id = Number(req.params.institut_id);

                const institutHasUserCreated = await models['institutHasUser'].create(valuesForPostInstitutHasUser);
                return institutHasUserCreated;

            } catch (error) {
                const message = `An error has occured creating the institutUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function checkSessionPlaceAvailable() {
            try {

                // 2 - Check si assez de place dans la session + si session pas encore validée
                const session = await models['Session'].findOne({
                    where: { session_id: req.params.idSession },
                    include: {
                        model: models['sessionUser'],
                        as: "sessionUsers",
                        attributes: ['user_id']
                    }
                });

                if (session === null) {
                    const message = `session doesn't exist. Retry with an other session id.`;
                    return res.status(404).json({ message });
                } else if (session.dataValues.sessionUsers.length + 1 > session.dataValues.placeAvailable) {
                    const message = `session is full!`;
                    return res.status(500).json({ message });
                } else if (session.dataValues.validation === true) {
                    const message = `session is validate, can't add user!`;
                    return res.status(500).json({ message });
                } else {
                    return true;
                }

            } catch (error) {
                const message = `An error has occured finding the session.`;
                return res.status(500).json({ message, data: error.message })
            }
        }




        async function findAllSessionExams() {
            try {

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
                const allExamsFromSession = await models['Exam'].findAndCountAll(parameters);
                return allExamsFromSession;

            } catch (error) {
                const message = `An error has occured finding the exams.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function postSessionUser(_userCreated) {
            try {

                // 5 - Créer le sessionUser req.body = object avec values et session
                const valuesForPostSessionUser = {};
                valuesForPostSessionUser.user_id = _userCreated.dataValues.user_id;
                valuesForPostSessionUser.session_id = req.params.idSession;
                valuesForPostSessionUser.hasPaid = req.body.hasPaid;
                valuesForPostSessionUser.paymentMode = req.body.paymentMode;

                const sessionUserCreated = await models['sessionUser'].create(valuesForPostSessionUser);
                return sessionUserCreated

            } catch (error) {
                const message = `An error has occured creating the sessionUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }



        async function postAllUserOptions(_sessionUserCreated, _allExamsFromSession) {
            try {

                // 6 - créer l'object pour le bulk
                let sessionUsersOptionsForCreate = [];
                _allExamsFromSession.rows.forEach((exam, index) => {
                    sessionUsersOptionsForCreate[index] = {};
                    sessionUsersOptionsForCreate[index].exam_id = exam.dataValues.exam_id;
                    sessionUsersOptionsForCreate[index].isCandidate = exam.dataValues.isOption === true ? false : true;
                    sessionUsersOptionsForCreate[index].sessionUser_id = _sessionUserCreated.dataValues.sessionUser_id;
                })


                // 7 - post les sessionsUserOptions en bulk
                const allUserOptionsCreated = await models['sessionUserOption'].bulkCreate(sessionUsersOptionsForCreate);
                return allUserOptionsCreated;

            } catch (error) {
                const message = `An error has occured creating the options.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {
            const userCreated = await createUser();
            const institutHasUserCreated = await postInstitutHasUser(userCreated);
            await checkSessionPlaceAvailable();
            const allExamsFromSession = await findAllSessionExams();
            const sessionUserCreated = await postSessionUser(userCreated);
            await postAllUserOptions(sessionUserCreated, allExamsFromSession);

            const message = `User has been created ,added to the institut, the session, and UserHasOptions have been created successfuly`;
            res.json({ message, data: sessionUserCreated });

        } catch (error) {
            const message = `An error has occured .`;
            return res.status(500).json({ message, data: error.message })
        }
    }
    );
}
