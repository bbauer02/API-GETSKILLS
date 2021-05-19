const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/levels/:id', isAuthenticated, isAuthorized,async (req,res) => {
        try {
            const Level = await models['Level'].findByPk(req.params.id);
            if(Level === null) {
                const message = `Level doesn't exist.Retry with an other level id.`;
                return res.status(404).json({message});
            }
            const message = `Level found`;
            res.json({message, data: Level})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}