const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/levels/test/:test_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            let Levels = await models['Level'].update(req.body,{where:{test_id:req.params.test_id}})

            Levels = await models['Level']
                .findAll({ where: { test_id: req.params.test_id } });

            const message = `${Levels.count} Levels with test_id:${req.params.test_id} have been updated `;
            res.json({message, data: Levels});
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