const {models} = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports =  (app) => {
    app.get('/api/sessions', async (req,res) => {
        try {
            const parameters = {};
            parameters.where = {};
            // Conditions
            // Session d'un institut
            if(req.query.institut) {
                const institut_id = parseInt(req.query.institut);
                if(isNaN(institut_id) ) {
                    const message = `Institut parameter should albe an integer.`;
                    return res.status(400).json({message})
                }
                parameters.where.institut_id = institut_id;
            }   
            // Sessions après une date
            if(req.query.after) {
                const after = moment(req.query.after,"DD/MM/YYYY").format('YYYY-MM-DD');
                parameters.where.start = {
                    [Op.gte]: after
                }
            }
            // Sessions avant une date
            if(req.query.before) {
                const before = moment(req.query.before,"DD/MM/YYYY").format('YYYY-MM-DD');
                parameters.where.start = {
                    [Op.lte]: before
                }
            }
            // Sessions dans entre 2 dates
            if(req.query.start && req.query.end) {
                const start = moment(req.query.start,"DD/MM/YYYY").format('YYYY-MM-DD');
                const end = moment(req.query.end,"DD/MM/YYYY").format('YYYY-MM-DD');
                parameters.where.start = {
                    [Op.between]: [start,end]
                }
            }
            else {
                // Sessions débutant à une date
                if(req.query.start) {
                    let start = moment(req.query.start +' 00:00',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    let end = moment(req.query.start + ' 23:59',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    parameters.where.start = {
                        [Op.between]: [start ,end]
                    }
                }
                // Sessions finissant à une date
                if(req.query.end) {
                    let start = moment(req.query.end +' 00:00',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    let end = moment(req.query.end + ' 23:59',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    parameters.where.end = {
                        [Op.between]: [start ,end]
                    }
                }
            }

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
            parameters.include = [{
                model: models['Institut'],
                attributes : ["label"]
            }];

            // Options 
            // Add Users
            if(req.query.users==="true")
            {
                const addUsers = {
                    model: models['sessionUser'],
                    include:[
                        {
                        model: models['User'],
                        attributes: {exclude:['password']},
                        include: [{
                            model: models['Country'],
                            as:"country",
                            attributes : ["label"]
                        },
                        {
                            model: models['Country'],
                            as:"nationality",
                            attributes : ["countryNationality"]
                        },
                        {
                            model: models['Country'],
                            as:"firstlanguage",
                            attributes : ["countryLanguage"]
                        }] 
                    }]
                };
                parameters.include.push(addUsers);
            }

            // Options 
            // Add Test

            if(req.query.tests==="true")
            {
                const addTests = {
                    model: models['Test'],
                    attributes: ['test_id','label','isInternal','parent_id'],
                    include:[{
                        as:"parent",
                        model: models['Test'],
                        attributes: ['test_id','label','isInternal','parent_id'],
                    }]
                };
                parameters.include.push(addTests);
                
                const addLevels = {
                    model: models['Level'],
                    attributes:['level_id','label','ref','description']
                };
                parameters.include.push(addLevels);
            }



            const Sessions = await models['Session'].findAndCountAll(parameters);
            const message = `${Sessions.count} sessions found`;
            res.json({message, data: Sessions.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}