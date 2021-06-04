const {models} = require('../../models');
module.exports =  (app) => {
    app.get('/api/stat/users', async (req,res) => {
        try {
            const parameters = {}; 
            parameters.include = [
                {
                    model: models['Country'],
                    as:'country',
                    attributes : ["label"]
                },
                {
                    model: models['Country'],
                    as:'nationality',
                    attributes : [["countryNationality",'label']]
                },
                {
                    model: models['Country'],
                    as:'firstlanguage',
                    attributes : [["countryLanguage",'label']]
                }
            ];
            parameters.attributes = ['country_id','birthday', 'nationality_id', 'firstlanguage_id', 'createdAt'];
            const numUsers = await models['User'].findAndCountAll(parameters);
            const message = `count of users`;
            res.json({message, data: numUsers});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}