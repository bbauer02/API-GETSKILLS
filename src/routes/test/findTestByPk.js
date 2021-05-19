const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/tests/:id', isAuthenticated, isAuthorized,async (req,res) => {
       try {
            const Test = await models['Test'].findAll({
                where: {
                    test_id: req.params.id
                },
                order:['label'], 
                include: [{
                    model: models['Level'],
                },
                {
                    model:models['Test'],
                    as: 'child',
                    include:[{
                        model: models['Level'],
                     }]
                },
                {
                    model:models['Test'],
                    as: 'parent',
                    include:[{
                        model: models['Level'],
                     }]
                }]
            });
            if(Test === null) {
                const message = `Test doesn't exist.Retry with an other test id.`;
                return res.status(404).json({message});
            }
            const message = `Test found`;
            res.json({message, data: Test})
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error.toString()})
       }


    });
}