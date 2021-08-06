const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

// TODO: isAuthenticated, isAuthorized
module.exports = (app) => {
  app.delete('/api/empowermentTests/:id', async (req, res) => {
    try {
      const EmpowermentTests = await models['empowermentTests'].findByPk(req.params.id);
      if(EmpowermentTests === null) {
        const message = `EmpowermentTests doesn't exist.Retry with an other EmpowermentTests id.`;
        return res.status(404).json({message});
      }
      const empowermentTestsDeleted = EmpowermentTests;
      await EmpowermentTests.destroy({where: { empowermentTests_id: EmpowermentTests.empowermentTests_id}});
      const message = `empowermentTests id:${empowermentTestsDeleted.empowermentTests_id} has been deleted`;
      res.json({message, data: empowermentTestsDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
