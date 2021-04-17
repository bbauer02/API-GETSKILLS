const {models} = require('../../models');
const { Op } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/sessions', async (req,res) => {
        try {
            const parameters = {};

            const Sessions = await models['Session'].findAndCountAll(parameters);
            const message = `${Sessions.count} sessions found`;
            res.json({message, data: Sessions.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}