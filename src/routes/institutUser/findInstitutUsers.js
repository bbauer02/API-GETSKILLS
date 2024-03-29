﻿const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {

    app.get('/api/instituts/:institut_id/users',isAuthenticated, isAuthorized, async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {institut_id:req.params.institut_id};
            // Parameter : LIMIT
            if(req.query.limit) {
                const limit = parseInt(req.query.limit);       
                if(isNaN(limit) ) {
                const message = `Limit parameter should be an integer.`;
                return res.status(400).json({message})
                }
                parameters.limit = limit;
            }
            
            // Parameter : OFFSET
            if(req.query.offset) {
                const offset = parseInt(req.query.offset);       
                if(isNaN(offset) ) {
                const message = `Offset parameter should be an integer.`;
                return res.status(400).json({message})
                }
                parameters.offset = parseInt(req.query.offset);
            }

            parameters.attributes = {exclude:['password']};
            parameters.include = [
                {
                    model: models['Role'],
                    attributes: ["label"],
                    where: {}
                },
                {
                    
                    model: models['User'],
                    attributes:{exclude:['password']},
                    include:[{
                        model: models['Country'],
                        as:'country',
                        attributes : ["label"]
                    },
                    {
                        model: models['Country'],
                        as:'nationality',
                        attributes : [["countryNationality",'label']]
                    },
                    {
                        model: models['Language'],
                        as:'firstlanguage',
                        attributes : ['nativeName']
                    }, 
                    {
                        model: models['sessionUser'],
                        include: [
                            {
                                model: models['Session'],
                                include: [
                                    {
                                        model: models['Test'],
                                    },
                                    {
                                        model: models['Level'],
                                    }
                                ]
                            }
                        ]
                    }
                    ]
                }
            ];

            // Parameter examinators
            if(req.query.examinators === "true") {
                parameters.include[0].where.power = { [Op.gt]: 1 }
            }

            const Users = await models['institutHasUser'].findAndCountAll(parameters);
            const message = `${Users.count} users found`;
            res.json({message, usersInstitut: Users.rows});

        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}