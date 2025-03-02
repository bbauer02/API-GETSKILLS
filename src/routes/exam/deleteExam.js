const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
  app.delete('/api/exams/:id', isAuthenticated, authorize, async (req, res) => {
    try {
      console.log(`DEBUG - deleteExam - Tentative de suppression de l'examen ID=${req.params.id}`);
      
      // Recherche de l'examen
      const exam = await models['Exam'].findByPk(req.params.id, {
        include: [{ model: models['Test'] }]
      });
      
      if(exam === null) {
        const message = `L'examen n'existe pas. Veuillez réessayer avec un autre identifiant d'examen.`;
        return res.status(404).json({message});
      }
      
      console.log(`DEBUG - deleteExam - Examen trouvé: ID=${exam.exam_id}, test_id=${exam.test_id}`);
      
      // Vérifier si l'examen est utilisé dans des sessions
      const sessionExams = await models['sessionHasExam'].findOne({
        where: { exam_id: exam.exam_id }
      });
      
      if (sessionExams) {
        const message = `Impossible de supprimer cet examen car il est utilisé dans une ou plusieurs sessions.`;
        return res.status(400).json({message});
      }
      
      // Supprimer les relations avec les compétences
      await models['ExamHasSkill'].destroy({
        where: { exam_id: exam.exam_id }
      });
      
      // Supprimer les relations avec les questions
      await models['examHasQuestion'].destroy({
        where: { exam_id: exam.exam_id }
      });
      
      // Supprimer l'examen
      const examDeleted = exam;
      await exam.destroy();
      
      const message = `L'examen ID:${examDeleted.exam_id} a été supprimé avec succès.`;
      res.json({message, exam: examDeleted});
    }
    catch(error) {
      console.error('Erreur lors de la suppression de l\'examen:', error);
      const message = `Service non disponible. Veuillez réessayer plus tard.`;
      res.status(500).json({message, data: error})
    }
  });
}
 