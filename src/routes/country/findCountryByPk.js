const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/countries/:id',  isAuthenticated, isAuthorized,async (req,res) => {
        try {
            const Country = await models['Country'].findByPk(req.params.id);
            if(Country === null) {
                const message = `Country doesn't exist.Retry with an other country id.`;
                return res.status(404).json({message});
            }
            const message = `Country found`;
            res.json({message, data: Country})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}