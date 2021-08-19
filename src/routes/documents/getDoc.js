const {ConstructDatasForPDf} = require("./manageQueryDocs");
const {createRepository, destroyTemporaryFolders, getFilesIn} = require("./manageFileSystem");
const {createPdf, mergePdf} = require("./managePDF");
const fs = require("fs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const path = require("path");
const {createPdfWithTemplate} = require("./managePDF");


/**
 * Récupération du document souhaité
 * @param institutId
 * @param docTypeId
 * @returns {Promise<void>}
 */
async function getDocument (institutId, docTypeId) {
    let document = null;

    try {
        document = await models['Document'].findOne({
            where: {institut_id: institutId, doctype: docTypeId}
        })
    } catch (err) {
        throw new Error("An error occurred. Try to another id document or POST one document." + err.message)
    }

    if (!document) {
        throw new Error("Type of document not found for your institut.")
    } else {
        return document.dataValues.filepath;
    }
}

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/documents/:doc/download/', async (req, res) => {

        const docTypeId = parseInt(req.params.doc);
        const institutId = parseInt(req.params.institut_id);
        const sessionId = parseInt(req.query.session_id);
        const userId = parseInt(req.query.user_id);

        /**
         * Envoyer le PDF dans la réponse HTTP
         * @param pdfFile
         */
        function reponseHTTPWithPdf (pdfFile) {
            const s = fs.createReadStream(pdfFile);
            const myFilename = encodeURIComponent("myDocument.pdf");
            res.setHeader('Content-disposition', 'inline; filename="' + myFilename + '"');
            res.setHeader('Content-Type', "application/pdf");
            s.pipe(res);
        }

        try {

            // destruction du dossier temporaire si existant
            await destroyTemporaryFolders();

            // création d'un tableau d'objets contenant toutes les infos
            const datasForPdf = await ConstructDatasForPDf(institutId, sessionId, userId);

            // récupération du template oo
            let odtTemplate = null
            if(docTypeId > 0) odtTemplate = await getDocument(institutId, docTypeId);

            // création du dossier temporaire dans lequel on met les PDF générés
            const folder = createRepository();

            // création des pdf en boucle sur les données construites
            if(docTypeId > 0) await createPdfWithTemplate(odtTemplate, folder, datasForPdf);
            if(docTypeId === 0) createPdf(folder, datasForPdf);

            // récupération des fichiers PDF qui ont été générés
            const files = getFilesIn(path.join(__dirname, 'temporary'))

            // pas de fichier PDF trouvés
            if (files.length === 0) {
                throw new Error('No PDF files created.')
            }

            // 1 fichier PDF généré
            if (files.length === 1) {
                reponseHTTPWithPdf(path.join(__dirname, 'temporary', files[0]))
            }

            // plusieurs fichiers PDF à fusionner ensemble
            if (files.length > 1) {
                const pdfFileNameMerged = await mergePdf(files);
                reponseHTTPWithPdf(path.join(__dirname, 'temporary', pdfFileNameMerged))
            }


        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });
}
