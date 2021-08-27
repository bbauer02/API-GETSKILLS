const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/languages/:id',async (req,res) => {
        try {
            const Language = await models['Language'].findByPk(req.params.id);
            if(Language === null) {
                const message = `Language doesn't exist.Retry with an other language id.`;
                return res.status(404).json({message});
            }
            const message = `Language found`;
            res.json({message, data: Language})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}