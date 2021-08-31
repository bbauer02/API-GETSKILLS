const {ConstructDatasForPDf} = require("../../services/manageQueryDocs");
const {createRepository, destroyTemporaryFolders, getFilesIn} = require("../../services/manageFileSystem");
const {createPdf, mergePdf} = require("../../services/managePDF");
const fs = require("fs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const path = require("path");
const DOC_TYPES = require("./index");
const {createPdfWithTemplate} = require("../../services/managePDF");


/**
 * Récupération du document souhaité
 * @param institutId
 * @param docTypeId
 * @returns {Promise<void>}
 */
async function getDocument (institutId, docTypeId) {
    let document = null;
    const TEMPLATES_FOLDER = process.cwd() + '/public/templates/';

    try {
        // recherche du template demandé
        document = await models['Document'].findOne({
            where: {institut_id: institutId, doctype: docTypeId}
        })
        return document.dataValues.filepath;

    } catch (err) {
        // si le template n'existe pas, on prend ceux par défaut
        if(!document) {
            switch (docTypeId) {
                case 0:
                    return TEMPLATES_FOLDER + 'Standard_facture.odt';
                case 1:
                    return TEMPLATES_FOLDER + 'Standard_dossier.odt';
                case 2:
                    return TEMPLATES_FOLDER + 'Standard_inscription.odt';
                case 3:
                    return TEMPLATES_FOLDER + 'Standard_convocation.odt';
                case 4:
                    return TEMPLATES_FOLDER + 'Standard_presence.odt';
                default:
                    throw new Error('no template found')
            }
        }
    }

}

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/documents/:doc/download/', async (req, res) => {

        const docTypeId = parseInt(req.params.doc);
        const institutId = parseInt(req.params.institut_id);
        const sessionId = parseInt(req.query.session_id);
        const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

        /**
         * Envoyer le PDF dans la réponse HTTP
         * @param pdfFile
         */
        function reponseHTTPWithPdf (pdfFile) {
            const s = fs.createReadStream(pdfFile);
            const myFilename = encodeURIComponent(DOC_TYPES[docTypeId] + ".pdf");
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
            let odtTemplate = await getDocument(institutId, docTypeId);

            // création du dossier temporaire dans lequel on met les PDF générés
            const folder = createRepository();

            // création des pdf en boucle sur les données construites
            await createPdfWithTemplate(odtTemplate, folder, datasForPdf);

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
