﻿const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/users/:user_id', isAuthenticated,isAuthorized, async (req, res) => {
        try {
            const parameters = {}; 
            parameters.where = {
                session_id: req.params.session_id,
                user_id: req.params.user_id
            };

            parameters.include = [{
                model: models['sessionUserOption'],
                where: {},
                include: [{
                    model: models['Exam']
                }]
            },
            {
                model: models['User'],
                attributes: { exclude: ['password'] },
                include: [{
                    model: models['Country'],
                    as: 'country',
                    attributes: ["label"]
                },
                {
                    model: models['Country'],
                    as: 'nationality',
                    attributes: [["countryNationality", 'label']]
                },
                {
                    model: models['Language'],
                    as: 'firstlanguage',
                    attributes: ['nativeName']
                },
                {
                    model: models['Role'],
                    as: 'systemRole'
                }]
            }
        ];

            const sessionUser = await models['sessionUser'].findOne(parameters);
            const message = 'sessionUser found';
            res.json({message, sessionUser});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}