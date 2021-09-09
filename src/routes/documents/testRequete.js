const {getAllFieldsForSchoolDocuments} = require("../../services/manageQueryDocs");

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/find_all', async (req, res) => {

        const institutId = req.params.institut_id;
        const sessionId = req.params.session_id;
        const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

        try {

            const result = await getAllFieldsForSchoolDocuments(institutId, sessionId, userId);

            if (result.length === 0)
                return res.status(400).json({message: 'no result found', data: {}})
            
            return res.status(200).json({message: "route ok", data: result });


        } catch (err) {
            return res.status(400).json({message: 'error: ' + err.message, data: {}})
        }

    });

}