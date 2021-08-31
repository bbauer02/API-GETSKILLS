const unoconv = require('unoconv-promise');
const PDFMerger = require('pdf-merger-js');
const path = require("path");
const fs = require("fs");


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
 * Envoyer le PDF dans la réponse HTTP
 * @param pdfFile
 */
function reponseHTTPWithPdf (pdfFile, responseHttp) {
    const s = fs.createReadStream(path.join(__dirname, 'temporary', pdfFile));
    const myFilename = encodeURIComponent("invoice.pdf");
    responseHttp.setHeader('Content-disposition', 'attachment; filename="' + myFilename + '"');
    responseHttp.setHeader('Content-Type', "application/pdf");
    s.pipe(responseHttp);
}

module.exports = {createPdfWithTemplate, mergePdf, reponseHTTPWithPdf}