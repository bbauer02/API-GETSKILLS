const path = require('path');
const fs = require("fs");
const {models} = require("../../models");

module.exports = (app) => {
    app.post('/api/docs/new', async (req, res) => {

        const institutId = 1 // req.body.institutId;
        const doctype = 0 // req.body.doctype;

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
        // on teste que la requete contient au moins 1 fichier
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // on récupère le  fichier et on crée le filepath
        const newFile = req.files.newFile;
        const uploadPath = process.cwd() + '/public/' + newFile.name;

        // déplacement du fichier uploader dans le dossier public
        await newFile.mv(uploadPath)
            // enregistrement des données du fichier dans la table
            .then(models['Document'].create({
                    institut_id: institutId,
                    filename: newFile.name,
                    doctype: doctype,
                    filepath: uploadPath,
                }).then(function (docCreated) {
                    const message = `${docCreated.filename} has been created.`;
                    return res.status(200).json({message, data: docCreated})
                }).catch(function (error) {
                    const message = `Creation impossible`;
                    return res.status(500).json({message, data: error.message})
                })
            ).catch(function (err) {
                if (err) return res.status(500).send('Moving uploaded file failed');
                return res.send('File uploaded');
            })
    });
}