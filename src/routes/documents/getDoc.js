const {ConstructDatasForPDf} = require("../../services/manageQueryDocs");
const {createRepository, destroyTemporaryFolders} = require("../../services/manageFileSystem");
const {mergePdf} = require("../../services/managePDF");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const path = require("path");
const {getFilesInTemporaryFolder} = require("../../services/manageFileSystem");
const {createPdfWithTemplate, reponseHTTPWithPdf} = require("../../services/managePDF");
const {getAllFieldsForSchoolDocuments, getAllFieldsForGetSkillsDocuments} = require("../../services/manageQueryDocs");


module.exports = (app) => {

    /**
     * Génération de un ou plusieurs fichiers PDF
     * @param datasForPdf
     * @param documentId
     * @param sessionId
     * @param userId
     * @returns {Promise<string[]>}
     */
    async function getDocumentPDF (datasForPdf, documentId, sessionId, userId) {

        // destruction du dossier temporaire si existant
        await destroyTemporaryFolders();

        // récupération du template oo
        let odtTemplate = await models['Document'].findByPk(documentId, {attributes: ['filepath', 'filepath']});

        if (!odtTemplate)
            throw new Error('no template found');

        // création du dossier temporaire dans lequel on met les PDF générés
        const folder = createRepository();

        // création des pdf en boucle sur les données construites
        await createPdfWithTemplate(odtTemplate.dataValues.filepath, folder, datasForPdf);

        // récupération des fichiers PDF qui ont été générés
        return getFilesInTemporaryFolder();

    }


    /**
     * La génération de PDF est réalisée par les écoles.
     */
    app.get('/api/instituts/:institut_id/sessions/:session_id/documents/:document_id/download', isAuthenticated, isAuthorized, async (req, res) => {

        const institutId = parseInt(req.params.institut_id)
        const documentId = parseInt(req.params.document_id);
        const sessionId = parseInt(req.params.session_id);
        const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

        try {

            // création d'un tableau d'objets contenant toutes les infos
            let datasForPdf = await getAllFieldsForSchoolDocuments(institutId, sessionId, userId);

            const files = await getDocumentPDF(datasForPdf, documentId);

            // pas de fichier PDF trouvés
            if (files.length === 0) {
                throw new Error('No PDF files created.')
            }

            // 1 fichier PDF généré
            if (files.length === 1) {
                reponseHTTPWithPdf(path.join(files[0]), res)
            }

            // plusieurs fichiers PDF à fusionner ensemble
            if (files.length > 1) {
                const pdfFileNameMerged = await mergePdf(files);
                reponseHTTPWithPdf(pdfFileNameMerged, res);
            }

        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });


}
