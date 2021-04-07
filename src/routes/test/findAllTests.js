const {models} = require('../../models');


module.exports =  (app) => {
    app.get('/api/tests', async (req,res) => {
       try {
            const Tests = await models['Test'].findAndCountAll({
                where: {
                    parent_id: null
                },
                order:['label'], 
                include: [{
                    model: models['Level'],
                    attributes : ["id", "label", "description", "ref"],
                    through: {
                        attributes: []
                    },
                },
                {
                    model:models['Test'],
                    as: 'children',
                    include:[{
                        model: models['Level'],
                        attributes : ["id", "label", "description", "ref"],
                        through: {
                            attributes: []
                        }
                    }]
                }
            ]
            });
            const message = `${Tests.count} test(s) found`;
            res.json({message, data: Tests.rows})
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error})
       }


    });
}