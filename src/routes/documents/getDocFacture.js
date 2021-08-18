import {ConstructDatasForPDf} from "./manageQueryDocs";
import {createRepository, destroyTemporaryFolders, getFilesIn} from "./manageFileSystem";
import {createPdf, mergePdf} from "./managePDF";
const fs = require("fs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const path = require("path");



/**
 * Récupération du document souhaité
 * @param documentId
 * @returns {Promise<void>}
 */
async function getDocument (documentId) {
    let document = null;

    try {
        document = await models['Document'].findByPk(documentId);
    } catch (err) {
        throw new Error("An error occurred. Try to another id document or POST one document." + err.message)
    }

    if (!document) {
        throw new Error("Document not found for id=" + documentId)
    } else {
        return document.dataValues.filepath;
    }
}

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/documents/:doc/download/', async (req, res) => {

        const documentId = req.params.doc;
        const institutId = req.params.institut_id;
        const sessionId = req.query.session_id;
        const userId = req.query.user_id;

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
            const odtTemplate = await getDocument(documentId);

            // création du dossier temporaire dans lequel on met les PDF générés
            const folder = createRepository();

            // création des pdf en boucle sur les données construites
            await createPdf(odtTemplate, folder, datasForPdf);

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
