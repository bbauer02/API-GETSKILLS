const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.put('/api/tests/:id', isAuthenticated, isAuthorized,async (req, res) => {
        try {
            const Test = await models['Test'].findByPk(req.params.id);
            if(Test === null) {
                const message = `Test doesn't exist.Retry with an other Test id.`;
                return res.status(404).json({message});
            }
            await Test.update(req.body,{
                where:{test_id:req.params.id}
            });
            const message = `Test id:${Test.test_id} has been updated `;
            res.json({message, data: Test});
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