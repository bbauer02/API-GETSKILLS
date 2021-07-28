const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

// UNUSED ROUTE

module.exports =  (app) => {

    app.get('/api/instituts/:institut_id/examinators',isAuthenticated, isAuthorized, async (req,res) => {
        try {
            const parameters = {};            
            parameters.attributes = {exclude:['password']};
            parameters.include = [
                {
                    model: models['Role']
                },
                {
                    model: models['User'],
                    attributes:{exclude:['password']},
                    where : { user_id : {[Op.not] : null}},
                    require: true,
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
                        model: models['Country'],
                        as:'firstlanguage',
                        attributes : [["countryLanguage",'label']]
                    },
                    {
                        model: models['Role'],
                        as:'systemRole'
                    },
                    {
                        model: models['empowermentTests'],
                        required: true,
                        include:[{
                            model: models['Test'],
                            attributes: ["label"]
                        }]
                    }]
                }
            ];

            parameters.where = {
                institut_id: req.params.institut_id            };

            const Users = await models['institutHasUser'].findAndCountAll(parameters);
            const message = `${Users.count} users found`;
            res.json({message, data: Users.rows});

        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}