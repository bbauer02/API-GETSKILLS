﻿const { models } = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.get('/api/exams', isAuthenticated, authorize, async (req, res) => {
        try {
            console.log('DEBUG - findAllExams - Requête reçue avec paramètres:', req.query);
            
            const parameters = {};
            parameters.where = {};
            parameters.include = [
                {
                    model: models['Test'],
                    include: [
                        {
                            model: models['Institut'],
                            as: 'owner',
                            attributes: ['institut_id', 'label']
                        }
                    ]
                },
                {
                    model: models['Level']
                },
                {
                    model: models['Skill'],
                    as: 'skills',
                    through: { attributes: [] }
                }
            ];
            
            // Paramètre : TEST
            if (req.query.test) {
                const test = parseInt(req.query.test);
                if (isNaN(test)) {
                    const message = `Le paramètre test doit être un entier.`;
                    return res.status(400).json({ message });
                }
                parameters.where.test_id = test;
            }
            
            // Paramètre : LEVEL
            if (req.query.level) {
                if (req.query.level !== "null") {
                    const level = parseInt(req.query.level);
                    if (isNaN(level)) {
                        const message = `Le paramètre level doit être un entier.`;
                        return res.status(400).json({ message });
                    }
                    parameters.where.level_id = level;
                }
            }
            
            // Paramètre : INSTITUT (propriétaire du test)
            if (req.query.institut) {
                const institut = parseInt(req.query.institut);
                if (isNaN(institut)) {
                    const message = `Le paramètre institut doit être un entier.`;
                    return res.status(400).json({ message });
                }
                parameters.include[0].where = { owner_id: institut };
            }
            
            // Paramètre : LIMIT
            if (req.query.limit) {
                const limit = parseInt(req.query.limit);
                if (isNaN(limit)) {
                    const message = `Le paramètre limit doit être un entier.`;
                    return res.status(400).json({ message });
                }
                parameters.limit = limit;
            }
            
            // Paramètre : OFFSET
            if (req.query.offset) {
                const offset = parseInt(req.query.offset);
                if (isNaN(offset)) {
                    const message = `Le paramètre offset doit être un entier.`;
                    return res.status(400).json({ message });
                }
                parameters.offset = offset;
            }

            const exams = await models['Exam'].findAll(parameters);
            console.log(`DEBUG - findAllExams - ${exams.length} examens trouvés`);
            
            const message = `${exams.length} examens trouvés`;
            res.json({ message, exams: exams });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des examens:', error);
            const message = `Service non disponible. Veuillez réessayer plus tard.`;
            res.status(500).json({ message, data: error.toString() });
        }
    });
}