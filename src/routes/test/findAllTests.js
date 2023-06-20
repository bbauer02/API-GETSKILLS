const {Op} = require("sequelize");
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/tests', async (req,res) => {
       try {

           const parameters = {};

           // Parameter : ARCHIVE (?archive=true)
           if(req.query.archive) {
               parameters.where = {isArchive: JSON.parse(req.query.archive)}
           } else {
               parameters.where = {isArchive: false}
           }


           // Parameter : ORDER
           parameters.order = [['label', 'ASC']]
           // Afficher les enfants également
           if(req.query.child)
           {
                if(req.query.child =="false") {
                    parameters.where = {parent_id: {[Op.is]: null}};
                }
           }
           else {
            parameters.where = {parent_id: {[Op.is]: null}};
           }
           

           // Parameter : INCLUDE
           parameters.include = [
               {
                   model: models['Test'],
                   as:'child',
                   include:[{
                       model: models['Level']
                   }]
               },
               {
                   model: models['Level']
               },
               {
                model: models['Test'],
                as:'parent', 
                attributes : ["test_id", "label"]
            },
           ]

            const Tests = await models['Test'].findAndCountAll(parameters);

            const message = `${Tests.count} test(s) found`;
            res.json({message, tests: Tests.rows});
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error})
       }
    });
}