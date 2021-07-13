const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/exams_prices/:institutId', async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = parseInt(req.params.institutId);

        // récupérer tous les tests

        try {
            const ExamsPrice = await models['Institut'].findAndCountAll({
                attributes: ['label'],
                where: {institut_id: institutId},
                required: true,
                include: [{
                    attributes: ['label'],
                    model: models['Exam'],
                    required: true,
                    include: [{
                        model: models['Test'],
                        attributes: ['label'],
                    }]
                }]
            });

            const message = `${ExamsPrice.count} price(s) found`;
            res.json({message, data: ExamsPrice.rows})
        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.message})
        }
    });
}