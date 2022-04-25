const unoconv = require('unoconv-promise');
const PDFMerger = require('pdf-merger-js');
const path = require("path");
const fs = require("fs");
const {getFilesInTemporaryFolder} = require("./manageFileSystem");
const {models} = require("../models");
const {destroyTemporaryFolders} = require("./manageFileSystem");
const {createRepository} = require("./manageFileSystem");


/**
 * Fonction de création d'un pdf
 * @param odtTemplate
 * @param outPutFolder
 * @param datasForPdf
 * @returns {Promise<void>}
 */
async function createPdfWithTemplate (odtTemplate, outPutFolder, datasForPdf) {
    let index = 0;

    for (const data of datasForPdf) {
        try {
            await unoconv.run({
                file: odtTemplate,
                fields: data,
                output: outPutFolder + '/temp-' + index + ".pdf"
            })
        } catch (err) {
            throw new Error("An error occurred when pdf is generated. " + err.message)
        }

        index += 1;
    }
}

/**
 * Fusionner des PDF
 * @param files
 * @returns {Promise<string>}
 */
async function mergePdf (files) {
    try {
        const merger = new PDFMerger();

        for await (const fileName of files) {
            merger.add(path.join(__dirname, 'temporary', fileName));
        }

        await merger.save(path.join(__dirname, 'temporary', 'merged.pdf'));

        return 'merged.pdf';

    } catch (error) {
        throw new Error('Error during merge pdf files : ' + error.message)
    }
}

/**
 * Génération de un ou plusieurs fichiers PDF par objet. Chaque flat object engendrera la création d'un pdf.
 * (flat object : pas d'arrays ni d'objets dans l'objet)
 * @param datasForPdf sous la forme : [ { flat object }, { } ...]
 * @param documentId
 * @param sessionId
 * @param userId
 * @returns {Promise<string[]>}
 */
async function getDocumentPDF (datasForPdf, documentId, sessionId, userId) {

    // destruction du dossier temporaire si existant
    await destroyTemporaryFolders();

    // récupération du template oo
    let odtTemplate = await models['Document'].findByPk(documentId, {attributes: ['filepath']});

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
 * Envoyer le PDF dans la réponse HTTP
 * @param responseHttp
 * @param attachment
 * @param pdfFile
 */
function reponseHTTPWithPdf (pdfFile, responseHttp, attachment = false) {
    const s = fs.createReadStream(path.join(__dirname, 'temporary', pdfFile));
    const myFilename = encodeURIComponent("invoice.pdf");
    responseHttp.setHeader('Content-disposition', (attachment ? 'attachment':'inline') + '; filename="' + myFilename + '"');
    responseHttp.setHeader('Content-Type', "application/pdf");
    s.pipe(responseHttp);
}

module.exports = {getDocumentPDF, createPdfWithTemplate, mergePdf, reponseHTTPWithPdf}