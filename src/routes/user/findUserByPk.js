const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/users/:id', async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {user_id:req.params.id};
            parameters.order = ['lastname'];
            parameters.include = [{
                model: models['Role'],
                attributes : ["label", "power"]
            },
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
            }];
            const Users = await models['User'].findOne(parameters);
            const message = `Users found`;
            res.json({message, data: Users});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}