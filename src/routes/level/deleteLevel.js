const {models} = require('../../models');
  
module.exports = (app) => {
  app.delete('/api/levels/:level_id', async (req, res) => {
    try {
      const Level = await models['Level'].findByPk(req.params.level_id);
      if(Level === null) {
        const message = `Level doesn't exist.Retry with an other level id.`;
        return res.status(404).json({message});
      }
      const LevelDeleted = Level;
      await Level.destroy({where: { level_id: Level.level_id}});
      const message = `Level id:${LevelDeleted.level_id} has been deleted`;
      res.json({message, data: LevelDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
 