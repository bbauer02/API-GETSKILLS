const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/tests/:id', async (req,res) => {
       try {
            const Test = await models['Test'].findAll({
                where: {
                    id: req.params.id
                },
                order:['label'], 
                include: [{
                    model: models['Level'],
                    attributes : ["id", "label", "description", "ref"],
                    through: {
                        attributes: []
                    }
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
         res.status(500).json({message, data: error})
       }


    });
}