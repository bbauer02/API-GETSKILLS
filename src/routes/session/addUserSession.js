const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/sessions/users', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            let hasError = false;

            // 0 - Check si assez de place dans la session
            await models['Session'].findOne({
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
                } else if (session.dataValues.sessionUsers.length +1 > session.dataValues.placeAvailable ) {
                    const message = `session is full!`;
                    hasError = true;
                    return res.status(500).json({ message });
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                hasError = true;
                return res.status(500).json({ message, data: error.message })
            });

            if (hasError === true) return res.status(500).json({message: "An error has occured"});

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
            const Exams = await models['Exam'].findAndCountAll(parameters);


            // 3 - Créer le sessionUser req.body = object avec values et session
            const sessionUser = await models['sessionUser'].create(req.body.values);


            // 4 - créer l'object pour le bulk
            let sessionUsersOptionsForCreate = [];
            Exams.rows.forEach((exam, index) => {
                sessionUsersOptionsForCreate[index] = {};
                sessionUsersOptionsForCreate[index].exam_id = exam.dataValues.exam_id;
                sessionUsersOptionsForCreate[index].isCandidate = exam.dataValues.isOption === true ? false : true;
                sessionUsersOptionsForCreate[index].sessionUser_id = sessionUser.sessionUser_id;
            })


            // 5 - post les sessionsUserOptions en bulk
            await models['sessionUserOption'].bulkCreate(sessionUsersOptionsForCreate);

            const message = `User id: ${sessionUser.user_id} has been added in the session id : ${sessionUser.session_id}.`;
            res.json({ message, data: sessionUser });
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() });
        }
    });
}
