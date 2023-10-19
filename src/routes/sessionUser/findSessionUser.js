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
                    // les epreuves obligatoires de la session
                    model: models['sessionHasExam'],
                    attributes: ['sessionHasExam_id', 'adressExam', 'room', 'DateTime'],
                    include: [{
                        model: models['Exam'],
                        attributes: ['exam_id', 'label', 'price', 'isOption'],
                        where: {isOption: false},
                        include: [{
                            model: models['InstitutHasPrices'],
                            required: false,
                            attributes: ['price', 'tva'],
                            where: { institut_id: req.params.institut_id}
                        }]
                    }]
                },
                {
                    // L'utilisateur de la session
                    model: models['sessionUser'],
                    where: {
                        user_id: req.params.user_id,
                    },
                    include: [
                        {
                            model: models['sessionUserOption'],
                        },
                        {
                            model: models['User'],
                        }
                    ]
                }
            ];

         
 
          
            const session = await models['Session'].findOne(parameters);
            const message = 'sessionUser found';
            res.json({message, sessionUser: session});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}



  /* parameters.include = [
                {
                  //  model:models['sessionHasExam'],
                },
               /* {
                    model: models['sessionUser'],
                    
                    where: 
                    {
                        user_id: req.params.user_id,
                    },
                    include: [{
                        model: models['sessionUserOption'],
                        include: [{
                            model: models['Exam'],
                            include: [{
                                model: models['sessionHasExam'],
 
                                where: {session_id: req.params.session_id}
                            },
                            {
                                model: models['InstitutHasPrices'],
                                // left join
                                required: false,

                                where: { institut_id: req.params.institut_id}
                            }                      
                        ]

                        }]

                    },
                    {
                        model: models['User'],
                    }]
                }
            
            ];*/