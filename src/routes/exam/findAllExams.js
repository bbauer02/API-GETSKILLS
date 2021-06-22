const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/exams',async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {};
            // Parameter : TEST
            if(req.query.test) {
                const test = parseInt(req.query.test);
                if(isNaN(test) ) {
                    const message = `Test parameter should be an integer.`;
                    return res.status(400).json({message})
                }   
                parameters.where.test_id = test;
            }
            // Parameter : LEVEL
            if(req.query.level) {
                const level = parseInt(req.query.level);
                if(isNaN(level) ) {
                    const message = `Level parameter should be an integer.`;
                    return res.status(400).json({message})
                }   
                parameters.where.level_id = level;
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

            const Exams = await models['Exam'].findAndCountAll(parameters);
           
            const message = `${Exams.count} exams found`;
           res.json({message, data: Exams.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}