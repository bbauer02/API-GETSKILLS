const path = require('path');
const fs = require("fs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {

    /**
     * Uplaod one document odt
     * @param doctype
     * @param files
     * @param institutId
     * @returns {Promise<*>}
     */
    async function uploadDocument (doctype, files, institutId = null) {

        const STORE_FILES = process.cwd() + '/public/';
        const d = new Date();

        // création du document
        // on teste que la requete contient au moins 1 fichier
        if (!files || Object.keys(files).length === 0) {
            throw new Error('No files were uploaded.');
        }

        // on récupère le  fichier et on crée le filepath
        const newFile = files.newFile;
        const uploadPath = STORE_FILES + d.getTime() + '.odt';

        // déplacement du fichier uploader dans le dossier public
        try {
            await newFile.mv(uploadPath)
        } catch (e) {
            throw new Error('Moving uploaded file failed -> ' + e.message);
        }

        // enregistrement des données du fichier dans la table
        try {
            const docCreated = await models['Document']
                .create({
                    institut_id: institutId,
                    filename: newFile.name,
                    doctype: doctype,
                    filepath: uploadPath,
                })

            if (!docCreated) {
                throw new Error('An error occurred during creation in the database.');
            }

            return docCreated

        } catch (e) {
            throw new Error('Creation impossible -> ' + e.message);
        }

    }

    /**
     * Upload de documents super admin
     */
    app.post('/api/documents/upload', isAuthenticated, isAuthorized, async (req, res) => {

        const doctype = parseInt(req.body.doctype);

        try {
            const document = await uploadDocument(doctype, req.files, null)
            return res.status(200).json({message: document.filename + " has been uploaded.", data: document})
        } catch (e) {
            res.status(500).json({message: e.message, data: null})
        }
    })

    /**
     * Upload de documents admin d'institut
     */
    app.post('/api/instituts/:institut_id/documents/upload', isAuthenticated, isAuthorized, async (req, res) => {

        const institutId = req.params.institut_id
        const doctype = req.body.doctype;

        try {
            const document = await uploadDocument(doctype, req.files, institutId)
            return res.status(200).json({message: document.filename + " has been uploaded.", data: document})
        } catch (e) {
            res.status(500).json({message: e.message, data: null})
        }

    })
}