const {models} = require('../../models');
const { Op } = require("sequelize");
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/tests/archive/:id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const Test = await models['Test'].findByPk(req.params.id);
            if(Test === null) {
                const message = `Test doesn't exist.Retry with an other Test id.`;
                return res.status(404).json({message});
            }

            // archivage du test
            Test.update({isArchive: true}, {where: {test_id: req.params.id}});

            // archivage de ses variants
            const Variants = await models['Test'].update({isArchive: true}, {where: {parent_id: req.params.id}});

            // archivage de ses levels
            const Levels = await models['Level'].update({isArchive: true}, {where: {test_id: req.params.id}});

            // archivage des levels de ses variants
            let Tests = await models['Level'].findAll( {
                include: [
                    {
                        attributes: ['test_id', 'parent_id'],
                        model:models['Test'],
                        required: true,
                        include: [
                            {
                                attributes: ['test_id', 'parent_id'],
                                model:models['Test'],
                                as: "parent",
                                where: {test_id: req.params.id}
                            }]
                    },
                ]
            });

            Tests.forEach((test) => {
                test.update({isArchive: true}, {where: {isArchive: true}})
            })

            const message = `Archivage : test id:${Test.test_id} - ${Variants.count} variants - ${Levels.count} levels: - levels from variants:${Tests.count}`;
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