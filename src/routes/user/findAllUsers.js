const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/users',isAuthenticated,isAuthorized, async (req,res) => {
        try {
           
            const parameters = {}; 
            parameters.where = {};
            // Recherche par identifiant du rôle system.
            if(req.query.systemRole) {
                const systemRole = parseInt(req.query.systemRole);
                if(isNaN(systemRole) ) {
                    const message = `systemRole parameter should be an integer.`;
                return res.status(400).json({message})
                } 
                parameters.where.systemRole_id = systemRole;
             }
            // Recherche par Nom ET Prénom
            if(req.query.fname && req.query.lname)
            {
                parameters.where = {
                    [Op.and]: [
                      {firstname:{ 
                        [Op.like] : `%${req.query.fname}%`
                      }},
                      {lastname:{ 
                        [Op.like] : `%${req.query.lname}%`
                      }}] 
                  }
            }
            else {
                // recherche par Prénom
                if(req.query.fname) {
                    parameters.where.firstname = {[Op.like] : `%${req.query.fname}%`}
                }
                // recherche par Nom
                if(req.query.lname) {
                    parameters.where.lastname = {[Op.like] : `%${req.query.lname}%`}
                }
            }
            // recherche par Email
            if(req.query.email) {
                parameters.where.email = {[Op.like] : `%${req.query.email}%`}
            }
            // recherche par pays
            if(req.query.country) {
                const country = parseInt(req.query.country);
                if(isNaN(country) ) {
                    const message = `Country parameter should be an integer.`;
                return res.status(400).json({message})
                } 
                parameters.where.country_id = country;
            }
            // recherche par nationalité
            if(req.query.natio) {
                const natio = parseInt(req.query.natio);
                if(isNaN(natio) ) {
                    const message = `Natio parameter should be an integer.`;
                return res.status(400).json({message})
                } 
                parameters.where.nationality_id = natio;
            }
            // recherche par langue maternelle
            if(req.query.flang) {
                const flang = parseInt(req.query.flang);  
                if(isNaN(flang) ) {
                    const message = `Flang parameter should be an integer.`;
                return res.status(400).json({message})
                } 
                parameters.where.firstlanguage_id  = flang;
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



            parameters.order = ['lastname'];
            parameters.attributes = {exclude:['password']};
            parameters.include = [{
                model: models['institutHasUser'],
                attributes:['institut_id'],
                as:'instituts',
                include:[{
                    model:models['Institut'],
                    attributes:['label']
                },
                {
                    model:models['Role'],
                    attributes:['role_id','label','power']
                }]
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
            },
            {
                model: models['Role'],
                as:'systemRole'
            }];
            const Users = await models['User'].findAndCountAll(parameters);
            const message = `${Users.count} users found`;
            res.json({message, data: Users.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}