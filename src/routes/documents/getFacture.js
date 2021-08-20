const {ConstructDatasForPDf} = require("./manageQueryDocs");

module.exports = (app) => {
    app.get("/api/instituts/:institut_id/facture", async (req, res) => {

        const docTypeId = 0;
        const institutId = parseInt(req.params.institut_id);
        const sessionId = parseInt(req.query.session_id);
        const userId = parseInt(req.query.user_id);

        try{

            // création d'un tableau d'objets contenant toutes les infos
            const datasForPdf = await ConstructDatasForPDf(institutId, sessionId, userId);

            if(datasForPdf.length === 0) {
                throw new Error("No datas for invoices PDF found.")
            }

            return res.status(200).json({message: "Datas for PDF invoices", data: datasForPdf})

        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    })
}