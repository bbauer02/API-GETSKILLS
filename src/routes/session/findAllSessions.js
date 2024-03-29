﻿const { models } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

module.exports = (app) => {
    app.get('/api/sessions', async (req, res) => {
        try {
            const parameters = {};
            parameters.where = {};

            // Conditions

            // filtre par level id
            if (req.query.level) {
                const level_id = parseInt(req.query.level);
                if (isNaN(level_id)) {
                    const message = `Level parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.where.level_id = level_id;
            }
            // filtre par test id
            if (req.query.test) {
                const test_id = parseInt(req.query.test);
                if (isNaN(test_id)) {
                    const message = `Level parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.where.test_id = test_id;
            }

            // Sessions après une date
            if (req.query.after) {
                const after = moment(req.query.after, "YYYY-MM-DD");
                parameters.where.start = {
                    [Op.gte]: after
                }
            }

            // Sessions avant une date
            if (req.query.before) {
                const before = moment(req.query.before, "YYYY-MM-DD");
                parameters.where.start = {
                    [Op.lte]: before
                }
            }

            // Sessions dans entre 2 dates
            if (req.query.start && req.query.end) {
                const start = moment(req.query.start, "YYYY-MM-DD");
                const end = moment(req.query.end, "YYYY-MM-DD");
                parameters.where.start = {
                    [Op.between]: [start, end]
                }
            }
            else {

                // Sessions débutant à une date
                if (req.query.start) {
                    let start = moment(req.query.start + ' 00:00', "DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    let end = moment(req.query.start + ' 23:59', "DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    parameters.where.start = {
                        [Op.between]: [start, end]
                    }
                }

                // Sessions finissant à une date
                if (req.query.end) {
                    let start = moment(req.query.end + ' 00:00', "DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    let end = moment(req.query.end + ' 23:59', "DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                    parameters.where.end = {
                        [Op.between]: [start, end]
                    }
                }
            }

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
                model: models['Institut'],
                attributes: ["label", "country_id", "city", "adress1", "adress2", "zipcode", "email", "phone"],
                where: {stripeActivated:1}
            }];

            // Filtrer par nom d'institut
            if (req.query.institut) {
                // Prend le premier include du parameters pour ajouter un parametre (de base where: {})
                parameters.include[0].where.label = { [Op.like]: `%${req.query.institut}%` }
            }

            // Filtre par Pays
            if (req.query.country) {
                const country_id = parseInt(req.query.country);
                if (isNaN(country_id)) {
                    const message = `Country parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.include[0].where.country_id = country_id;
            }
            // Filtre par City
            if (req.query.city) {
                const city = req.query.city;
                parameters.include[0].where.city = city;
            }


            // Options 

            const addUsers = {
                model: models['sessionUser'],
                attributes: ['user_id']
            };

            parameters.include.push(addUsers);

            const addTests = {
                model: models['Test'],
                attributes: ['test_id', 'label', 'isInternal', 'parent_id'],
                include: [{
                    as: "parent",
                    model: models['Test'],
                    attributes: ['test_id', 'label', 'isInternal', 'parent_id'],
                }]
            };
            parameters.include.push(addTests);

            const addLevels = {
                model: models['Level'],
                attributes: ['level_id', 'label', 'ref', 'description']
            };
            parameters.include.push(addLevels);

            const addInstitut = {
                model: models['Institut'],
                attributes: ['label']
            };
            parameters.include.push(addInstitut);
            parameters.distinct = true;
           // parameters.group = ['session_id'];
            const sessions = await models['Session'].findAll(parameters);
            const message = `${sessions.length} sessions found`;
            res.json({ message, sessions });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() })
        }
    });
}