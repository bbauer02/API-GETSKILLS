const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/roles/:id', async (req,res) => {
        try {
            const Role = await models['Role'].findByPk(req.params.id);
            if(Role === null) {
                const message = `Role doesn't exist.Retry with an other role id.`;
                return res.status(404).json({message});
            }
            const message = `Role found`;
            res.json({message, data: Role})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}