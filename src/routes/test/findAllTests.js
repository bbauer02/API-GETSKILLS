const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/tests', isAuthenticated, isAuthorized,async (req,res) => {
       try {
            const Tests = await models['Test'].findAndCountAll({
                where: {
                 parent_id:null
                },
                order:['label'], 
                include:
                [
                    {
                        model: models['Test'],
                        as:'child',
                        include:[{
                            model: models['Level']
                        }]
                    },
                    {
                        model: models['Level']
                    }
                ]
            });
            const message = `${Tests.count} test(s) found`;
            res.json({message, data: Tests.rows});
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error})
       }


    });
}