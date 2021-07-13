const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/exams_prices/update', async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = req.body.institut_id;
        const examId = req.body.exam_id;
        const price = req.body.price;

        // récupérer tous les tests
        try {
            const ExamPrice = await models['ExamsPrice'].findOne(
                { where: {[Op.and]: [{institut_id: institutId},{exam_id: examId}]}});

            if(ExamPrice  === null) {
                const message = `price doesn't exist. Retry with an other exam id.`;
                return res.status(404).json({message});
            }

           await ExamPrice.update({
                exam_id: examId,
                price: price,
            }, {
                where: {[Op.and]: [{institut_id: institutId},{exam_id: examId}]}
            })

            const message = `Price for exam id = ${ExamPrice.exam_id} has been updated.`;
            res.json({message, data: ExamPrice})

        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.message})
        }
    });
}