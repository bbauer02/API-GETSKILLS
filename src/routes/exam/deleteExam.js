const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/exams/:id', isAuthenticated, isAuthorized,async (req, res) => {
    try {
      const Exam = await models['Exam'].findByPk(req.params.id);
      if(Exam === null) {
        const message = `Exam doesn't exist.Retry with an other Exam id.`;
        return res.status(404).json({message});
      }
      const examDeleted = Exam;
      await Exam.destroy({where: { exam_id: Exam.exam_id}});
      const message = `Institut id:${examDeleted.exam_id} has been deleted`;
      res.json({message, exam: examDeleted});
    }
    catch(error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({message, data: error})
    }

  });
}
 