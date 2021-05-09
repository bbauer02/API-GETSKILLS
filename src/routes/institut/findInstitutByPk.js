﻿﻿const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/instituts/:id', async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {institut_id:req.params.id};
            parameters.include = [{
                model: models['Country'],
                as:"institutCountry",
                attributes : ["label"]
            }];

            const Institut = await models['Institut'].findOne(parameters);
            if(Institut === null) {
                const message = `Institut doesn't exist.Retry with an other institut id.`;
                return res.status(404).json({message});
            }
            const message = `Institut found`;
            res.json({message, data: Institut})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}