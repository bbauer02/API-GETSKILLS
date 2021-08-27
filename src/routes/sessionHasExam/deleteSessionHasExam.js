const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
  app.delete('/api/instituts/:institut_id/sessions/:session_id/exams/:exam_id', isAuthenticated, isAuthorized, async (req, res) => {

    try {

      const sessionHasExam = await models['sessionHasExam'].findOne({
        where: {
          session_id: req.params.session_id,
          exam_id: req.params.exam_id
        }
      });

      if (sessionHasExam === null) {
        const message = `sessionHasExam doesn't exist. Retry with an other sessionHasExam id.`;
        return res.status(404).json({ message });
      }

      const sessionHasExamDelete = sessionHasExam;
      await sessionHasExam.destroy({ where: { sessionHasExam_id: sessionHasExam.sessionHasExam_id } });

      const message = `sessionHasExam id:${sessionHasExamDelete.sessionHasExam_id} has been deleted`;
      res.json({ message, data: sessionHasExamDelete });
    }

    catch (error) {
      const message = `Service not available. Please retry later.`;
      res.status(500).json({ message, data: error })
    }

  });
}
