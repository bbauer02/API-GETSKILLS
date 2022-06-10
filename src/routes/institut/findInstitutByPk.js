const { Sequelize } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/instituts/:institut_id', isAuthenticated, isAuthorized, async (req,res) => {
        try {
            const parameters = {}; 

            
            parameters.attributes = {
                include: [
                    [ Sequelize.literal(`(SELECT count(*) FROM sessions WHERE sessions.institut_id = ${req.params.institut_id})`), 'nbrSessions'],
                    [ Sequelize.literal(`(SELECT count(*) FROM institut_has_user WHERE institut_has_user.institut_id = ${req.params.institut_id})`), 'nbrUsers'] 
                ]
            }
            parameters.include = [{
                model: models['Country'],
                as:"institutCountry",
                attributes : ["label"]
            }];

            parameters.where = {institut_id:req.params.institut_id};

            const Institut = await models['Institut'].findOne(parameters);
            if(Institut === null) {
                const message = `Institut doesn't exist.Retry with an other institut id.`;
                return res.status(404).json({message});
            }
            const message = `Institut found`;
            res.json({message, institut: Institut})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}

/*    ,
            {
                model: models['Session'],
                attributes: [
                   [Sequelize.fn('COUNT', Sequelize.col('sessions.institut_id')) , "count" ]
                ]
            }     */