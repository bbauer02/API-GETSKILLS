const {models} = require('../../models');
const { Op } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/languages', async (req,res) => {
        try {
            const parameters = {};


            if(req.query.name) {
                parameters.where = {
                    label: {
                        [Op.like] : `%${req.query.name}%`
                    }
                }
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