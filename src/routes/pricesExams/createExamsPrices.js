const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/exams_prices/new', async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = req.body.institut_id;
        const examId = req.body.exam_id;
        const price = req.body.price;

        // récupérer tous les tests
        try {

            const ExamPrice = await models['ExamsPrice'].create({
                institut_id: institutId,
                exam_id: examId,
                price: price,
            })

            const message = `Price for ${ExamPrice.exam_id} has been created.`;
            res.json({message, data: ExamPrice})

        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.message})
        }
    });
}