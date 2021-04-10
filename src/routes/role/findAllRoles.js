const {models} = require('../../models');
const { Op } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/roles', async (req,res) => {
        try {
            const parameters = {};
            const Roles = await models['Role'].findAndCountAll();
            const message = `${Roles.count} roles found`;
            res.json({message, data: Roles.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}