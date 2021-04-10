const {models} = require('../../models');
const { Op } = require('sequelize');

module.exports =  (app) => {
    app.get('/api/countries', async (req,res) => {
        try {
            const parameters = {};


            if(req.query.name) {
                parameters.where = {
                    label: {
                        [Op.like] : `%${req.query.name}%`
                    }
                }
            }
            if(req.query.lang) {
                parameters.where = {
                        language: {
                            [Op.like] : `%${req.query.lang}%`
                        }
                }
            }
            if(req.query.code) {
                parameters.where = {
                    code: {
                        [Op.like] : `%${req.query.code}%`
                    }
                }
            }
            if(req.query.nationality) {
                parameters.where = {
                    nationality: {
                        [Op.like] : `%${req.query.nationality}%`
                    }
                }
            }
            const Countries = await models['Country'].findAndCountAll(parameters);
            const message = `${Countries.count} countries found`;
            res.json({message, data: Countries.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}