const {models} = require('../../models');
const { Op } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/languages', async (req,res) => {
        try {
            const parameters = {};
            if(req.query.search) {
                parameters.where = {
                    language: {
                        [Op.like] : `%${req.query.search}%`
                    }
                };
            } 
            parameters.include = [{
                model: models['Country'],
                attributes : [["country","label"]]              
            }];

            if(req.query.country) {
                parameters.include[0].where = {id:req.query.country}
            }

            const Languages = await models['Language'].findAndCountAll(parameters);
            const message = `${Languages.count} languages found`;
            res.json({message, data: Languages.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}