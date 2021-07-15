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

        try {
            // vérifier l'institut
            const institut = await models['Institut'].findOne({
                where: {institut_id: institutId}
            })
            if(institut  === null) {
                const message = `institut doesn't exist. Retry with an other institut id.`;
                return res.status(404).json({message});
            }

            // vérifier l'exam
            const exam = await models['Exam'].findOne({
                where: {exam_id: institutId}
            })
            if(exam  === null) {
                const message = `exam doesn't exist. Retry with an other exam id.`;
                return res.status(404).json({message});
            }

            // récupérer tous les tests
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