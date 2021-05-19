const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  app => {
    app.post('/api/tests',isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const test = await models['Test'].create(req.body);
            const message = `The test '${req.body.label}' has been created.`;
            res.json({message,data:test})
        }
        catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Test cannot be created. Retry later. `;
            res.status(500).json({message, data:error});
        }
    });
}