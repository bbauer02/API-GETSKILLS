const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  app => {
    app.post('/api/exams',isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const exam = await models['Exam'].create(req.body);
            const message = `The exam '${req.body.label}' has been created.`;
            res.json({message,data:exam})
        }
        catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Level cannot be created. Retry later. `;
            res.status(500).json({message, data:error});
        }
    });
}