const {Op} = require("sequelize");
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/skills',isAuthenticated, isAuthorized, async (req,res) => {
       try {

           const parameters = {};

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

            // Parameter : ARCHIVE (?archive=true)
           if(req.query.archive) {
               parameters.where = {isArchive: JSON.parse(req.query.archive)}
           } else {
               parameters.where = {isArchive: false}
           }
            const message = `${Skills.count} skill(s) found`;
            res.json({message, data: Skills.rows});
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error.message})
       }
    });
}