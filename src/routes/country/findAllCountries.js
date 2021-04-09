const {models} = require('../../models');
const { Op, Sequelize } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/countries', async (req,res) => {
        try {
            const parameters = {};
            if(req.query.search) {
                const lower = Sequelize.fn('LOWER',Sequelize.col('country'));
                parameters.where = {
                    country: {
                        [Op.like] : `%${req.query.search}%`
                    }
                }
            }
            const Countries = await models['Country'].findAndCountAll(parameters);
            const message = `${Countries.count} countries found`;
            res.json({message, data: Countries.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}