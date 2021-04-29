const {models} = require('../../models');
  
module.exports = (app) => {
  app.delete('/api/tests/:id', async (req, res) => {
    try {
      const Test = await models['Test'].findByPk(req.params.id);
      if(Test === null) {
        const message = `Test doesn't exist.Retry with an other Test id.`;
        return res.status(404).json({message});
      }
      const TestDeleted = Test;
      await Test.destroy({where: { test_id: Test.test_id}});
      const message = `Test id:${TestDeleted.test_id} has been deleted`;
      res.json({message, data: TestDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
 