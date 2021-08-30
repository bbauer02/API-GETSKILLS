const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const parameters = {};
            parameters.where = { session_id: req.params.session_id };

            parameters.include = [
                {
                    model: models['Institut'],
                    attributes: ["label"],
                    include: [{
                        model: models['Country'],
                        as: "institutCountry",
                        attributes: ["label", "country_id"]
                    }],
                },
                {
                    model: models['sessionHasExam']
                },
                {
                    model: models['Test']
                },
                {
                    model: models['Level']
                },
                {
                    model: models['sessionUser'],
                    include: [{
                        model: models['User'],
                        attributes: { exclude: ['password'] },
                        include: [
                            {
                                model: models['sessionUser'],
                                include: [{
                                    model: models['sessionUserOption'],
                                    include: [{
                                        model: models['Exam']
                                    }]
                                }]
                            },
                            {
                                model: models['Country'],
                                as: "country",
                                attributes: ["label"]
                            },
                            {
                                model: models['Country'],
                                as: "nationality",
                                attributes: ["countryNationality"]
                            },
                            {
                                model: models['Language'],
                                as: "firstlanguage",
                                attributes: ["nativeName"]
                            }]
                    }]
                }
            ];

            const Session = await models['Session'].findOne(parameters);
            if (Session === null) {
                const message = `Session doesn't exist.Retry with an other Session id.`;
                return res.status(404).json({ message });
            }
            const message = `Session found`;
            res.json({ message, data: Session });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() });
        }
    });
}