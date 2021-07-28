const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  app => {
    app.post('/api/skills',isAuthenticated, isAuthorized, async (req, res) => {

        try {
            const skill = await models['Skill'].create(req.body);
            const message = `The skill '${req.body.label}' has been created.`;
            res.json({message,data:skill})
        }
        catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error.message})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error.message})
            }
            const message = `Skill cannot be created. Retry later. `;
            res.status(500).json({message, data:error.message});
        }
    });
}