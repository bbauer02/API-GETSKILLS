const {models} = require("../../models");
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/docs/:institut_id',isAuthenticated, isAuthorized, async (req, res) => {

        const institutId = req.params.institut_id;

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

        // obtenir les documents
        await models["Document"].findAll({
            order: [['filename', 'ASC']],
            where: {institut_id: institutId}
        }).then(function(docsFound) {
            return res.status(201).json({message: 'documents found', data: docsFound})
        }).catch(function(error){
            return res.status(500).json({message: 'no documents found. ' + error.message, data: null})
        })

    });
}