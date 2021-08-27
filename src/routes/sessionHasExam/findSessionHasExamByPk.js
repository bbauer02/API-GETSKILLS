const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/exams/:exam_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const parameters = {};
            parameters.where = { 
                session_id: req.params.session_id,
                exam_id: req.params.exam_id
             };

            parameters.include = [{
                model: models['Session'],
                include: [{
                    model: models['Institut']
                }]
            }];

            const SessionHasUser = await models['sessionHasUser'].findOne(parameters);
            if (SessionHasUser === null) {
                const message = `SessionHasUser doesn't exist.Retry with another session or exam id.`;
                return res.status(404).json({ message });
            }
            const message = `SessionHasUser found`;
            res.json({ message, data: SessionHasUser });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error.toString() });
        }
    });
}