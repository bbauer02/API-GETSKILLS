const {models} = require('../../models');
const { Op } = require("sequelize");
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/tests/archivevariant/:id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const Test = await models['Test'].findByPk(req.params.id);
            if(Test === null) {
                const message = `Test doesn't exist.Retry with an other Test id.`;
                return res.status(404).json({message});
            }

            // archivage du test enfant
            Test.update({isArchive: true}, {where: {test_id: req.params.id}});

            // archivage de ses levels
            const Levels = await models['Level'].update({isArchive: true}, {where: {test_id: req.params.id}});

            const message = `Archivage : test id:${Test.test_id} and its ${Levels.count} levels`;
            res.json({message, data: {Test}});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.message});
        }
    });
}