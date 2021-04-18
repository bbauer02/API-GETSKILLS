const {models} = require('../../models');

module.exports =  (app) => {
    app.get('/api/sessions/:id', async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {session_id:req.params.id};
            parameters.include = [{
                model: models['Institut'],
                attributes : ["label"]
            }];
            const addUsers = {
                model: models['sessionHasUser'],
                include:[{
                    model: models['User'],
                    attributes: {exclude:['password']},
                    include: [{
                        model: models['Country'],
                        as:"country",
                        attributes : ["label"]
                    },
                    {
                        model: models['Country'],
                        as:"nationality",
                        attributes : ["countryNationality"]
                    },
                    {
                        model: models['Country'],
                        as:"firstlanguage", 
                        attributes : ["countryLanguage"]
                    }] 
                }]
            };
            parameters.include.push(addUsers);

            const addTests = {
                model: models['testHasLevel'],
                attributes: ['testLevel_id'],
                include:[{
                    model: models['Test']
                },
                {
                    model: models['Level']
                }]
            };
            parameters.include.push(addTests);
            
            const Session = await models['Session'].findOne(parameters);
            if(Session === null) {
                const message = `Session doesn't exist.Retry with an other Session id.`;
                return res.status(404).json({message});
            }
            const message = `Session found`;
            res.json({message, data: Session});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}