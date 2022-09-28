﻿const { models } = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/exams', async (req, res) => {
        try {
            const parameters = {};
            parameters.where = {};
            parameters.include = [{
                attributes: ['exam_id','price', 'tva'],
                model: models['InstitutHasPrices'],
                as: 'InstitutHasPrices'
            },
            {
                model: models['Test']
            },
            {
                model: models['Level']
            }];
            
            
            // Parameter : TEST
            if (req.query.test) {
                const test = parseInt(req.query.test);
                if (isNaN(test)) {
                    const message = `Test parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.where.test_id = test;
            }
            // Parameter : LEVEL
            if (req.query.level) {
                if (req.query.level !== "null") {
                    const level = parseInt(req.query.level);
                    if (isNaN(level)) {
                        const message = `Level parameter should be an integer.`;
                        return res.status(400).json({ message })
                    }
                    parameters.where.level_id = level;
                }

            }
            // Parameter : PRICE
            if (req.query.price) {
                const price = parseInt(req.query.price);
                if (isNaN(price)) {
                    const message = `price parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.where.price = price;
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

            if (req.query.institut) {
                const institut = parseInt(req.query.institut);
                if (isNaN(institut)) {
                    const message = `institut parameter should be an integer.`;
                    return res.status(400).json({ message })
                }
                parameters.where['$InstitutHasPrices.institut_id$'] = {
                    [Op.or]: [institut, null]
                }
            }
            const Exams = await models['Exam'].findAll(parameters);
            const message = `${Exams.length} exams found`;
            res.json({ message, exams: Exams });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() })
        }
    });
}