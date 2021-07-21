const {models} = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
  app.get('/api/levels', isAuthenticated, isAuthorized, async (req,res) => {
    try {
      // calcul le nombre d'arguments dans la requête
      //const countArgs = Object.keys(req.query).length;
      const parameters = {};
      // Parameter : LABEL ET REF
      console.log(req.query.archive)
      if(req.query.label && req.query.ref) {
        parameters.where = {
          [Op.or]: [
            {label:{ 
              [Op.like] : `%${req.query.label}%`
            }},
            {ref:{ 
              [Op.like] : `%${req.query.ref}%`
            }}] 
        }
      } 
      // IF ONLY one of the 2 are passed
      else {
          // Parameter : LABEL
          if(req.query.label) {
            parameters.where = {
                label:{
                [Op.like] : `%${req.query.label}%`
            }}
          }
          // Parameter : REF
          if(req.query.ref) {
            parameters.where = {
                ref:{
                [Op.like] : `%${req.query.ref}%`
            }}
          }
      }
      // Parameter : ARCHIVE (?archive=true)
      if(req.query.archive) {
        parameters.where = {isArchive: JSON.parse(req.query.archive)}
      } else {
        parameters.where = {isArchive: false}
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
      // Parameter : ORDER
      parameters.order = [['label', 'ASC']]

      const Levels = await models['Level'].findAndCountAll(parameters);
      const message = `${Levels.count} level(s) found`;
      res.json({message, data: Levels.rows})
    }
    catch (error){
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }
  });
  }