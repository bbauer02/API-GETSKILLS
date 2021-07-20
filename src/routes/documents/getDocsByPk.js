const path = require('path');
const fs = require("fs");
const {models} = require("../../models");

const dir = path.join(__dirname, 'public');

const mime = {
    odt: 'application/vnd.oasis.opendocument.text',
};

module.exports = (app) => {
    app.post('/api/docs/new', async (req, res) => {

        const institutId = req.body.institutId;
        const fileName = req.body.filename;
        const doctype = req.body.doctype;

        // vérifier l'institut
        await models['Institut'].findOne({
            where: {institut_id: institutId}
        }).then(function (institutFound) {
            if (institutFound === null) {
                const message = `institut doesn't exist. Retry with an other institut id.`;
                return res.status(404).json({message});
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });


        // création du document
        await models['Document'].findOne({
            where: {docuement_id: documentId}
        }).then(function (documentFound) {
            if(documentFound) {
                // le documenent exsite déjà
                const message = `Creation impossible. Docuement already exist. Try PUT method.`;
                return res.status(500).json({message, data: null})
            } else {
                // le document est absent de la table
                models['Document'].create({
                    institut_id: institutId,
                    fileName: fileName,
                    doctype: doctype,
                    filepath:
                }).then(function (docCreated) {
                    const message = `${docCreated.filename} has been created.`;
                    return res.status(200).json({message, data: docCreated})
                }).catch(function (error) {
                    const message = `Creation impossible`;
                    return res.status(500).json({message, data: error.message})
                })
            }
        })

        console.log(req.path, dir);
        const file = path.join(dir, req.path + '/testPaul.odt');
        console.log(file);
        if (file.indexOf(dir + path.sep) !== 0) {
            return res.status(403).end('Forbidden');
        }
        const type = mime[path.extname(file).slice(1)] || 'text/plain';
        console.log(path.extname(file).slice(1));
        const s = fs.createReadStream(file);
        s.on('open', function () {
            res.set('Content-Type', type);
            s.pipe(res);
        });
        s.on('error', function () {
            res.set('Content-Type', 'text/plain');
            res.status(404).end('Not found');
        });
    });
}