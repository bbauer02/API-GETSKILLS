const path = require('path');
const fs = require('fs');
const {models} = require("../../models");

module.exports = (app) => {
    app.delete('/api/docs/:documentId', async (req, res) => {

        const documentId = req.params.documentId;


        // on vérifie que l'id demandé se trouve dans la table
        await models['Document'].findOne({
            where: {document_id: documentId}
        }).then(function (documentFound) {
            if (documentFound) {
                // le document existe
                // on supprime le document. On lève une exception en cas d'erreur
                fs.unlink(documentFound.filepath, function (error) {
                    if (error) throw new Error('File deletion failed')
                    console.log('File deleted successfully');
                })
                // suppression des données dans la table
                models['Document'].destroy({
                    where: {document_id: documentId}
                }).then(function (documentDestroyed) {
                    const message = `Document has been deleted.`;
                    return res.status(200).json({
                        message,
                        data: {document_id: documentId, filename: documentDestroyed.filename}
                    })
                }).catch(function (error) {
                    const message = `Destroy impossible`;
                    return res.status(500).json({message, data: error.message})
                })
            } else {
                // le document demandé n'est pas dans la table
                const message = `Destroy impossible. Document does not already exist. Create a new document before delete.`;
                return res.status(500).json({message, data: null})
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        })
    });
}