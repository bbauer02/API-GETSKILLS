const {models} = require('../../models');
const { Op } = require("sequelize");
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/tests/archive/:id', isAuthenticated, isAuthorized, async (req, res) => {
        try {

            await models['Test'].update(req.body, {where: {test_id: req.params.id}});

            await models['Test'].update(req.body, {where: {parent_id: req.params.id}});

            await models['Level'].update(req.body, {where: {test_id: req.params.id}});

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
                test.update(req.body, {where: {isArchive: true}})
            })


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
            res.status(500).json({message, data: error.message});
        }
    });
}