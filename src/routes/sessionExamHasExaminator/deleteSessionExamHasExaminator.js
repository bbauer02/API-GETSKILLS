const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/instituts/:institut_id/sessionexams/:session_has_exam_id/sessionexamexaminators/:session_exam_has_examinator_id',
   isAuthenticated, isAuthorized, async (req, res) => {

    try {

      const sessionExamHasExaminator = await models['sessionExamHasExaminator'].findOne({
        where: {
          sessionExamHasExaminator_id: req.params.session_exam_has_examinator_id
        }
      });

      if (sessionExamHasExaminator === null) {
        const message = `sessionExamHasExaminator doesn't exist. Retry with an other sessionExamHasExaminator_id.`;
        return res.status(404).json({ message });
      }

      const sessionExamHasExaminatorDelete = sessionExamHasExaminator;
      await sessionExamHasExaminator.destroy({ where: { 
        sessionExamHasExaminator_id: sessionExamHasExaminator.sessionExamHasExaminator_id 
      } });

      const message = `sessionExamHasExaminator id:${sessionExamHasExaminatorDelete.sessionExamHasExaminator_id} has been deleted`;
      res.json({ message, data: sessionExamHasExaminatorDelete });
    }

    catch (error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({ message, data: error })
    }

  });
}
