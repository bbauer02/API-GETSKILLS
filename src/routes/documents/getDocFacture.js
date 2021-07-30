const fs = require("fs");
const {models} = require("../../models");
const unoconv = require('unoconv-promise');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/docs/download/facture/:doc', async (req, res) => {

        const documentId = req.params.doc;
        const type = "application/pdf";

        // vérifier le document
        await models['Document'].findOne({
            where: {document_id: documentId}
        }).then(function (docFound) {
            if (docFound === null) {
                const message = `document doesn't exist. Retry with an other document id.`;
                return res.status(404).json({message});
            } else {
                unoconv.run({
                    file: docFound.filepath,
                    fields: {maVariable: 'IUT RCC', monNom: 'Paul'},
                    output: process.cwd() + '/public/' + "temp.pdf",
                }).then(filePath => {
                    const s = fs.createReadStream(filePath);
                    const myFilename = encodeURIComponent("myDocument.pdf");
                    res.setHeader('Content-disposition', 'inline; filename="' + myFilename + '"');
                    res.setHeader('Content-Type', type);
                    s.pipe(res);
                })
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });
    });
}