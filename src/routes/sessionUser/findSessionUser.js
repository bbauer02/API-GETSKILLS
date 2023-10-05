const {models} = require('../../models');
const { Op, where } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/users/:user_id', isAuthenticated,isAuthorized, async (req, res) => {
        try {
            const parameters = {
                attributes: ['session_id']
            }; 
            parameters.where = {
                session_id: req.params.session_id,

            };

            parameters.include = [
                {
                    model: models['sessionUser'],
                    where: 
                    {
                        user_id: req.params.user_id,
                    },
                    include: [{
                        model: models['sessionUserOption'],
                        include: [{
                            model: models['Exam'],
                            where: {isOption: true},
                            include: [{
                                model: models['sessionHasExam'],
                                where: {session_id: req.params.session_id}
                            }]

                        }]

                    },
                    {
                        model: models['User'],
                    }]
                }
            
            ];
 
          
            const session = await models['Session'].findOne(parameters);
            const message = 'sessionUser found';
            res.json({message, sessionUser: session.sessionUsers[0]});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}




/* 
  const parameters = {
                attributes: ['session_id']
            }; 
            parameters.where = {
                session_id: req.params.session_id,

            };

            parameters.include = [{
                model: models['sessionUser'],
                where: 
                {
                    user_id: req.params.user_id,
                },
                include: [{
                    model: models['sessionUserOption'],
                    include: [{
                        model: models['Exam'],
                        where: {isOption: true},
                        include: [{
                            model: models['sessionHasExam'],
                            where: {session_id: req.params.session_id}
                        }]

                    }]

                }]
            }];

            */