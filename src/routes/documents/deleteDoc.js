const path = require('path');
const fs = require('fs');
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {


    /**
     * Suppression de docuement de la base et sur le disque
     * @param documentId
     * @returns {Promise<*>}
     */
    async function deleteDocument (documentId) {

        const docFound = await models['Document'].findByPk(documentId);

        if (!docFound)
            throw new Error('no document found');

        // suppression du document sur le disque
        fs.unlink(docFound.filepath, function (error) {
            if (error) throw new Error('File deletion failed')
            console.log('File deleted successfully');
        })

        // suppression des données dans la base
        await models['Document'].destroy({
            where: {document_id: documentId}
        })

        return docFound;

    }

    /**
     * Réponse http de suppression d'un document
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async function responseDeletionDocument(req, res) {
        const documentId = req.params.document_id;

        try {
            const docDestroyed = await deleteDocument(documentId);

            return res.status(200).json({
                message: `Document ${docDestroyed.filename} has been deleted.`,
                data: docDestroyed
            })

        } catch (e) {
            return res.status(500).json({message: 'erreur:' + e.message, data: null})
        }
    }

    app.delete('/api/documents/:document_id', isAuthenticated, isAuthorized, async (req, res) => {
      await responseDeletionDocument(req, res);
    });
    app.delete('/api/instituts/:institut_id/documents/:document_id', isAuthenticated, isAuthorized, async (req, res) => {
        await responseDeletionDocument(req, res);
    });
}