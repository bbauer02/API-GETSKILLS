const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const fs = require("fs");
const {getDataForDocuments, getDocumentPDF} = require('../../services/documents');
const { deleteTempRepository } = require('../../services/documents/fileSystemManager');
module.exports = (app) => {

    /**
     * La génération de PDF est réalisée par les écoles.
     */
    app.get('/api/instituts/:institut_id/sessions/:session_id/documents/:document_id/download', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            // On récupére les informations nécessaire à la collecte des données.
            const institutId = parseInt(req.params.institut_id)
            const documentId = parseInt(req.params.document_id);
            const sessionId = parseInt(req.params.session_id);
            const userId = req.query.user_id ? parseInt(req.query.user_id) : null;
            // On collecte les données
            const datas = await getDataForDocuments(institutId, sessionId, userId);
            //return res.status(200).json({datas})
            const pdfStream = await getDocumentPDF(datas,documentId);
            // On retourne en réponse le fichier PDF généré.
            res.contentType("application/pdf");
            pdfStream.pipe(res);
            await deleteTempRepository(documentId);
            
        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });


}
