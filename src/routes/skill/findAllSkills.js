const {Op} = require("sequelize");
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/skills',isAuthenticated, isAuthorized, async (req,res) => {
       try {

        const parameters = {};
        parameters.where = {};

        // filtre par test id
        if (req.query.test) {
            const test_id = parseInt(req.query.test);
            if (isNaN(test_id)) {
                const message = `Level parameter should be an integer.`;
                return res.status(400).json({ message })
            }
            parameters.where.test_id = test_id;
        }

        // Parameter : LIMIT
        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            if (isNaN(limit)) {
                const message = `Limit parameter should be an integer.`;
                return res.status(400).json({ message })
            }
            parameters.limit = limit;
        }
        // Parameter : OFFSET
        if (req.query.offset) {
            const offset = parseInt(req.query.offset);
            if (isNaN(offset)) {
                const message = `Offset parameter should be an integer.`;
                return res.status(400).json({ message })
            }
            parameters.offset = parseInt(req.query.offset);
        }
           // Parameter : ORDER
           parameters.order = [['label', 'ASC']]

           // Parameter : INCLUDE
           parameters.include = [
               {
                   model: models['Skill'],
                   as:'child',
                   include: [{
                       model: models['Skill'],
                       as:'child'
                   }]
               },
           ]

            const Skills = await models['Skill'].findAndCountAll(parameters);

           
            const message = `${Skills.count} skill(s) found`;
            res.json({message, skills: Skills.rows});
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error.message})
       }
    });
}