const {models} = require('../../models');
  
module.exports = (app) => {
  app.delete('/api/instituts/:id', async (req, res) => {
    try {
      const Institut = await models['Institut'].findByPk(req.params.id);
      if(Institut === null) {
        const message = `Institut doesn't exist.Retry with an other institut id.`;
        return res.status(404).json({message});
      }
      const institutDeleted = Institut;
      await Institut.destroy({where: { institut_id: Institut.institut_id}});
      const message = `Institut id:${institutDeleted.institut_id} has been deleted`;
      res.json({message, data: institutDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
 