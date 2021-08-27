const { models } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/exams', async (req, res) => {

        try {
            const parameters = {};
            parameters.where = {};

            // Parameter : LIMIT
            if (req.query.limit) {
                const limit = parseInt(req.query.limit);
                if (isNaN(limit)) {
                    const message = `Limit parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.limit = limit;
            }
            // Parameter : OFFSET
            if (req.query.offset) {
                const offset = parseInt(req.query.offset);
                if (isNaN(offset)) {
                    const message = `Offset parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.offset = parseInt(req.query.offset);
            }

            parameters.include = [{
                model: models['Session'],
                include: [{
                    model: models['Institut']
                }]
            }];


            // Add Users
            if (req.query.users === "true") {
                parameters.include =
                    [{
                        model: models['Session'],
                        include: [{
                            model: models['Institut']
                        },
                        {
                            model: models['sessionUser'],
                            include: [
                                {
                                    model: models['User'],
                                    attributes: { exclude: ['password'] },
                                    include: [{
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
                        }]
                    }];
            }

            const SessionshasUsers = await models['sessionHasExam'].findAll(parameters);
            const message = `${SessionshasUsers.length} sessionHasExams found`;
            res.json({ message, data: SessionshasUsers });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() })
        }
    });
}