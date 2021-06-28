const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/tests/parent/:parent_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            let Tests = await models['Test']
                .findAndCountAll({ where: { parent_id: req.params.parent_id } });

            if(Tests.count === 0) {
                const message = `Tests doesn't exist. Retry with an other parent id.`;
                return res.status(404).json({message});
            }

            Tests = await models['Test'].update(req.body,{where:{parent_id:req.params.parent_id}})

            Tests = await models['Test']
                .findAndCountAll({ where: { parent_id: req.params.parent_id } });

            const message = `${Tests.count} Tests with parent_id:${req.params.parent_id} have been updated `;
            res.json({message, data: Tests});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}