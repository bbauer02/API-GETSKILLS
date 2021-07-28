const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/exams/:exam_id/price/', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = req.params.institut_id;
        const examId = req.params.exam_id;
        const price = req.body.price;


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

        // mettre à jour l'épreuve
        await models['ExamsPrice'].findOne({
            where: {institut_id: institutId, exam_id: examId}
        }).then(function (examPriceFound) {
            if (examPriceFound) {
                // le prix existe déjà
                examPriceFound.update(
                    {price: price},
                    {
                        where: {
                            institut_id: institutId,
                            exam_id: examId
                        }
                    }
                ).then(function (examPriceCreated) {
                    const message = `Price for ${examPriceCreated.price} coin has been updated.`;
                    return res.status(200).json({message, data: examPriceCreated})
                }).catch(function (error) {
                    const message = `Update impossible`;
                    return res.status(500).json({message, data: error.message})
                })

            } else {
                // le prix n'a pas été défini -> il faut le créer
                const message = `Update impossible. Price does not exist. Try POST method.`;
                return res.status(500).json({message, data: null})
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });
    })
}