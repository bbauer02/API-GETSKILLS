const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.delete('/api/instituts/exams/price/:exam_id', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = req.body.institut_id;
        const examId = req.params.exam_id;


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


        // détruirel'examen
        await models['ExamsPrice'].findOne({
            where: {institut_id: institutId, exam_id: examId}
        }).then(function (examPriceFound) {
            if (examPriceFound) {
                // le prix existe
                models['ExamsPrice'].destroy({
                    where: {institut_id: institutId, exam_id: examId}
                }).then(function (examPriceDestroyed) {
                    const message = `Price has been deleted.`;
                    return res.status(200).json({message, data: {institut_id: institutId, exam_id: examId}})
                }).catch(function (error) {
                    const message = `Destroy impossible`;
                    return res.status(500).json({message, data: error.message})
                })

            } else {
                // le prix n'a pas été défini, il n'exsite pas dans la bd
                const message = `Destroy impossible. Price does not already exist. Create a new price before delete.`;
                return res.status(500).json({message, data: null})
            }

        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        })
    });
}