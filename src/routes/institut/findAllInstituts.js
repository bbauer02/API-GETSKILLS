const {models} = require('../../models');
const { Op } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/instituts', async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {};
            // Recherche par nom.
            if(req.query.name) {
                parameters.where.label = {[Op.like] : `%${req.query.name}%`}
            }
            // Recherche par pays
            if(req.query.country) {
                const country_id = parseInt(req.query.country);
                if(isNaN(country_id) ) {
                    const message = `Country parameter should be an integer.`;
                    return res.status(400).json({message})
                }
                parameters.where.country_id = country_id;
            } 
            // Recherche par ville
            if(req.query.city) {
                parameters.where.city = {[Op.like] : `%${req.query.city}%`}
            }
            // Recherche par email
            if(req.query.email) {
                parameters.where.email = {[Op.like] : `%${req.query.email}%`}
            }
            // Parameter : LIMIT
            if(req.query.limit) {
                const limit = parseInt(req.query.limit);       
                if(isNaN(limit) ) {
                    const message = `Limit parameter should be an integer.`;
                    return res.status(400).json({message})
                }
                parameters.limit = limit;
            }
            // Parameter : OFFSET
            if(req.query.offset) {
                const offset = parseInt(req.query.offset);       
                if(isNaN(offset) ) {
                const message = `Offset parameter should be an integer.`;
                return res.status(400).json({message})
                }
                parameters.offset = parseInt(req.query.offset);
            }
            parameters.order = ['label'];
            parameters.include = [{
                    model: models['Country'],
                    as:"institutCountry",
                    attributes : ["label"]
                }];

            const Instituts = await models['Institut'].findAndCountAll(parameters);
           
            const message = `${Instituts.count} instituts found`;
           res.json({message, data: Instituts.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}