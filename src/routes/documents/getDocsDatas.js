const {Op} = require("sequelize");
const {models} = require("../../models");
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');


module.exports = (app) => {

    /**
     * Obtenir les données sur un document uploadé dans la base
     * Les template de get-skills sont fournis par défaut aux écoles
     * @param institutId
     * @returns {Promise<Model[]>}
     */
    async function getDataOnDocuments (institutId = null) {
        let queryParameter = {institut_id: institutId}

        if(institutId)
            queryParameter = {[Op.or]: [{institut_id: institutId}, {institut_id: null}]}

        return await models["Document"].findAll({
            order: [['filename', 'ASC']],
            where: queryParameter
        });

    }

    app.get('/api/documents', isAuthenticated, isAuthorized, async (req, res) => {

        try {
            const docsFound = await getDataOnDocuments();
            const message = docsFound.length > 0 ? `${docsFound.length} documents found` : 'no documents found'
            return res.status(200).json({message, data: docsFound})
        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });

    app.get('/api/instituts/:institut_id/documents', isAuthenticated, isAuthorized, async (req, res) => {

        const institutId = req.params.institut_id;

        try {
            const docsFound = await getDataOnDocuments(institutId);
            const message = docsFound.length > 0 ? `${docsFound.length} documents found` : 'no documents found'
            return res.status(200).json({message, data: docsFound})
        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });
}