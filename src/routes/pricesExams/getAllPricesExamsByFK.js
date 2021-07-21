const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/exams_prices', async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = req.query.institut_id;
        const examId = req.query.exam_id;

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


        // vérifier l'exam
        await models['Exam'].findOne({
            where: {exam_id: institutId}
        }).then(function (examFound) {
            if (examFound === null) {
                const message = `exam doesn't exist. Retry with an other exam id.`;
                return res.status(404).json({message});
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });


        // récupérer le prix de l'épreuve
        await models['ExamsPrice'].findOne({
            where: {institut_id: institutId, exam_id: examId}
        }).then(function (examPriceFound) {
            if(examPriceFound === null) {
                const message = `No Exam price found`;
                res.json({message, data: null})
            } else {
                const message = `One Exam price found`;
                res.json({message, data: examPriceFound})
            }
        }).catch(function (error) {
            const message = `No price found`;
            res.status(500).json({message, data: null})
        });
    })
}