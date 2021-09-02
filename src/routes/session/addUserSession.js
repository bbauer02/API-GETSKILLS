const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/users', isAuthenticated, isAuthorized, async (req, res) => {


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
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the User.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function checkInstitutHasUser(_user) {
            try {

                // 1 - Check si le user est déjà inscrit dans l'institut
                const institutHasUser = await models['institutHasUser'].findOne({
                    where: {
                        user_id: _user.user_id,
                        institut_id: Number(req.params.institut_id)
                    }
                });

                return institutHasUser !== null

            } catch (error) {
                const message = `An error has occured checking if the user was already in the institut.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function postInstitutHasUser(_user) {
            try {

                // 2 - Post Institut has user
                const valuesForPostInstitutHasUser = {};
                valuesForPostInstitutHasUser.role_id = 1;
                valuesForPostInstitutHasUser.user_id = _user.user_id;
                valuesForPostInstitutHasUser.institut_id = Number(req.params.institut_id);

                const institutHasUserCreated = await models['institutHasUser'].create(valuesForPostInstitutHasUser);
                return institutHasUserCreated;

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the institutUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function checkSessionPlaceAvailable() {
            try {

                // 3 - Check si assez de place dans la session + si session pas encore validée
                const session = await models['Session'].findOne({
                    where: { session_id: req.params.session_id },
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

                // 4 - initialiser les parameters pour trouver les exams
                const parameters = {};
                parameters.where = {
                    session_id: req.params.session_id
                };

                parameters.include = [
                    {
                        model: models['Exam']
                    }
                ];

                // 5 - chercher les sessionExams de la session
                const allExamsFromSession = await models['sessionHasExam'].findAndCountAll(parameters);
                return allExamsFromSession;

            } catch (error) {
                const message = `An error has occured finding the exams.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        async function postSessionUser(_user) {
            try {

                // 6 - Créer le sessionUser req.body = object avec values et session
                const valuesForPostSessionUser = {};
                valuesForPostSessionUser.user_id = _user.user_id;
                valuesForPostSessionUser.session_id = req.params.session_id;
                valuesForPostSessionUser.hasPaid = req.body.hasPaid;
                valuesForPostSessionUser.paymentMode = req.body.paymentMode;

                const sessionUserCreated = await models['sessionUser'].create(valuesForPostSessionUser);
                return sessionUserCreated

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the sessionUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function postAllUserOptions(_sessionUserCreated, _allExamsFromSession) {
            try {

                // 7 - créer l'object pour le bulk
                let sessionUsersOptionsForCreate = [];
                _allExamsFromSession.rows.forEach((exam, index) => {
                    sessionUsersOptionsForCreate[index] = {};
                    sessionUsersOptionsForCreate[index].exam_id = exam.dataValues.exam_id;
                    sessionUsersOptionsForCreate[index].isCandidate = exam.dataValues.Exam.isOption === true ? false : true;
                    sessionUsersOptionsForCreate[index].sessionUser_id = _sessionUserCreated.dataValues.sessionUser_id;
                    console.log('\n\nexam=', exam, "\n\n");

                });


                // 8 - post les sessionsUserOptions en bulk
                const allUserOptionsCreated = await models['sessionUserOption'].bulkCreate(sessionUsersOptionsForCreate);
                return allUserOptionsCreated;

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the options.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        async function postAllSessionExamHasExaminators(_sessionUserCreated, _allExamsFromSession) {
            try {

                // 9 - créer l'object pour le bulk
                let sessionExamHasExaminatorsForCreate = [];
                _allExamsFromSession.rows.forEach((exam, index) => {
                    if (exam.dataValues.Exam.isOption === false) {
                        sessionExamHasExaminatorsForCreate[index] = {};
                        sessionExamHasExaminatorsForCreate[index].sessionHasExam_id = exam.dataValues.sessionHasExam_id;
                        sessionExamHasExaminatorsForCreate[index].sessionUser_id = _sessionUserCreated.dataValues.sessionUser_id;
                    }
                });

                // 10 - post les sessionExamHasExaminators en bulk
                await models['sessionExamHasExaminator'].bulkCreate(sessionExamHasExaminatorsForCreate);

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


        try {

            let user = {}

            // Si le user id n'est pas défini, créer le user
            // Le but étant d'avoir un user_id pour créer le institutHasUser
            // valeur par défautl de user_id === '', donner par formik
            if (req.body.user_id === '') {
                const userCreated = await createUser();
                user = userCreated;
            }

            // Sinon cela va dire que le user existe déjà et qu'on l'ajoute
            // seulement à l'institut 
            // On a donc déjà l'id, qu'on donnera à user pour la méthode postInstitutHasUser
            else {
                user.user_id = req.body.user_id;
            }

            // On check si le user est déjà inscrit à l'institut
            const isAlreadyInInstitut = await checkInstitutHasUser(user);

            // S'il n'est pas inscrit, on créer le institutHasUser 
            if (isAlreadyInInstitut === false) {
                await postInstitutHasUser(user);
            }

            // On check s'il y a assez de place dans la session, et si elle est déjà validée ou non.
            await checkSessionPlaceAvailable();

            // On cherche tout les exams correspondants au test et au level de la session
            const allExamsFromSession = await findAllSessionExams();

            // On inscrit le user à la session
            const sessionUserCreated = await postSessionUser(user);

            // On créer tout les sessionUserOptions
            await postAllUserOptions(sessionUserCreated, allExamsFromSession);

            // On créer tout les sessionExamHasExaminator (par users)
            await postAllSessionExamHasExaminators(sessionUserCreated, allExamsFromSession);

            const message = isAlreadyInInstitut === true ?
                `User has been created, added the session, all UserHasOptions and all sessionExamHasExaminators has been created successfuly`
                :
                `User has been created, added to the institut, added the session, all UserHasOptions and all sessionExamHasExaminators has been created successfuly`
                ;
            res.json({ message, data: sessionUserCreated });

        } catch (error) {
            const message = `An error has occured.`;
            return res.status(500).json({ message, data: error.message })
        }
    }
    );
}
