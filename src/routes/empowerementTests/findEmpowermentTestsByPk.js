const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/empowermentTests/:id', async (req,res) => {
        try {
            const EmpowermentTests = await models['empowermentTests'].findByPk(req.params.id);
            if(EmpowermentTests === null) {
                const message = `empowermentTests doesn't exist.Retry with an other empowermentTests id.`;
                return res.status(404).json({message});
            }
            const message = `empowermentTests found`;
            res.json({message, data: EmpowermentTests})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}