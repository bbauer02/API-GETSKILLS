const { models } = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {

    app.get('/api/instituts/:institut_id/users/:user_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const parameters = {};
            parameters.where = {
                institut_id: req.params.institut_id,
                user_id: req.params.user_id
            };

            parameters.attributes = { exclude: ['password'] };
            parameters.include = [
                {
                    model: models['Institut']
                },
                {
                    model: models['Role']
                },
                {
                    model: models['User'],
                    attributes: { exclude: ['password'] },
                    include: [{
                        model: models['Country'],
                        as: 'country',
                        attributes: ["label"]
                    },
                    {
                        model: models['Country'],
                        as: 'nationality',
                        attributes: [["countryNationality", 'label']]
                    },
                    {
                        model: models['Country'],
                        as: 'firstlanguage',
                        attributes: [["countryLanguage", 'label']]
                    },
                    {
                        model: models['Role'],
                        as: 'systemRole'
                    }]
                }
            ];
            const InstitutHasUser = await models['institutHasUser'].findOne(parameters);
            if (InstitutHasUser === null) {
                const message = `institutHasUser doesn't exist.Retry with an other institut id or user id.`;
                return res.status(404).json({ message });
            }
            const message = `institutHasUser found`;
            res.json({ message, data: InstitutHasUser });

        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() })
        }
    });
}