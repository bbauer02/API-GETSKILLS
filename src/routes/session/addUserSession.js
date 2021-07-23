const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/sessions/users',  isAuthenticated,isAuthorized, async (req,res) => {
        try{
            // req.body = object avec values et session
            const sessionUser = await models['sessionUser'].create(req.body.values);

            // initialiser les parameters pour trouver les exams
            // 1
            const parameters = {};
            parameters.where = {};


            // trouver les exams depuis test id et level id(si pas null) depuis le req.body
            // 2
            const test = parseInt(req.body.session.test_id);
            parameters.where.test_id = test;

            if (req.body.session.level_id !== null) {
                const level = parseInt(req.body.session.level_id); 
                parameters.where.level_id = level;
            }

            const Exams = await models['Exam'].findAndCountAll(parameters);


            // post les sessionsUserOptions en bulk
            // 3
            let sessionUsersOptionsForCreate = [];
            // console.log(Exams.rows);
            Exams.rows.forEach((exam, index) => {
                console.log("examId =", exam.dataValues.exam_id, "index =", index);
                sessionUsersOptionsForCreate[index] = {};
                sessionUsersOptionsForCreate[index].exam_id = exam.dataValues.exam_id;
                sessionUsersOptionsForCreate[index].isCandidate = exam.dataValues.isOption === true ? false: true;
                sessionUsersOptionsForCreate[index].sessionUser_id = sessionUser.sessionUser_id;
            })
            
            await models['sessionUserOption'].bulkCreate(sessionUsersOptionsForCreate);

            const message = `User id: ${sessionUser.user_id} has been added in the session id : ${sessionUser.session_id}.`;
            res.json({message, data: sessionUser});
        }catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()});
        }    
    });
}
