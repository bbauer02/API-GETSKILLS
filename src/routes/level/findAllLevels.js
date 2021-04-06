const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/levels', async (req,res) => {
       try {
            const Levels = await models['Level'].findAndCountAll({order:['label']});
            const message = `${Levels.count} level(s) found`;
            res.json({message, data: Levels.rows})
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error})
       }


    });
}