const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.get('/api/users/:user_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const parameters = {};
            parameters.where = { user_id: req.params.user_id };
            parameters.order = ['lastname'];
            parameters.include = [
                {
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
                    model: models['Language'],
                    as: 'firstlanguage',
                    attributes: ['nativeName']
                },
                {
                    model: models['institutHasUser'],
                    attributes: ['institut_id'],
                    as: 'instituts',
                    include: [{
                        model: models['Institut'],
                        attributes: ['label']
                    },
                    {
                        model: models['Role'],
                        attributes: ['role_id', 'label', 'power']
                    }]
                },
                {
                    model: models['Role'],
                    as: 'systemRole',
                    attributes: ['role_id', 'label', 'power']
                }];

            // Add sessions
            if (req.query.sessions === "true") {
                const addSessions = {
                    model: models['sessionUser'],
                    where: { user_id: req.params.user_id },
                    include: [
                        {
                            model: models['Session'],
                            include: [
                                {
                                    model: models['Institut'],
                                    attributes: ['institut_id', 'label']
                                },
                                {
                                    model: models['Level'],
                                    attributes: ['level_id', 'label']
                                },
                                {
                                    model: models['Test'],
                                    attributes: ['test_id', 'label']
                                }
                            ]
                        }]
                };
                parameters.include.push(addSessions);
            }

            // parameters.attributes = {exclude:['password']};
            const User = await models['User'].findOne(parameters);
            if (User === null) {
                const message = `User doesn't exist.Retry with an other user id.`;
                return res.status(404).json({ message });
            }
            const message = `Users found`;
            res.json({ message, data: User });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }
    });
}