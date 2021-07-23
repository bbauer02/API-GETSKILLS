const fs = require("fs");
const {models} = require("../../models");
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/docs/download/:doc',isAuthenticated, isAuthorized, async (req, res) => {

        const documentId = req.params.doc;
        const type = "application/vnd.oasis.opendocument.text";

        // vérifier le document
        await models['Document'].findOne({
            where: {document_id: documentId}
        }).then(function (docFound) {
            if (docFound === null) {
                const message = `document doesn't exist. Retry with an other document id.`;
                return res.status(404).json({message});
            } else {
                const s = fs.createReadStream(docFound.filepath);
                s.on('open', function () {
                    res.set('Content-Type', type);
                    s.pipe(res);
                });
                s.on('error', function () {
                    res.set('Content-Type', 'text/plain');
                    res.status(404).end('Not found');
                });
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });

    });
}