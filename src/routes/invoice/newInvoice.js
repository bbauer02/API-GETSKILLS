const {ConstructDatasForInvoice} = require("../documents/manageQueryDocs");
const {models} = require("../../models");

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/session/:session_id/orders', async (req, res) => {

        const institutId = req.params.institut_id;
        const sessionId = req.params.session_id;

        try {
            const facture = await ConstructDatasForInvoice(institutId, sessionId);

            if (!facture) {
                return res.status(400).json({message: 'no facture generated', data: null});
            }

            return res.status(200).json({message: 'facture', data: facture})

        } catch (e) {
            return res.status(500).json({message: 'error' + e.message, data: null});
        }

    });
}