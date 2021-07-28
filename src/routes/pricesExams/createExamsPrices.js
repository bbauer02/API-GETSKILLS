const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/exams/price', isAuthenticated, isAuthorized, async (req, res) => {

            // PARAMETERS
            //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
            const institutId = req.body.institut_id;
            const examId = req.body.exam_id;
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


            // création de l'épreuve
            await models['ExamsPrice'].findOne({
                where: {institut_id: institutId, exam_id: examId}
            }).then(function (examPriceFound) {
                if (examPriceFound) {
                    // le prix existe déjà
                    const message = `Creation impossible. Price already exist. Try PUT method.`;
                    return res.status(500).json({message, data: null})

                } else {
                    // le prix n'a pas été défini -> il faut le créer
                    models['ExamsPrice'].create({
                        institut_id: institutId,
                        exam_id: examId,
                        price: price,
                    }).then(function (examPriceCreated) {
                        const message = `Price for ${examPriceCreated.price} coin has been created.`;
                        return res.status(200).json({message, data: examPriceCreated})
                    }).catch(function (error) {
                        const message = `Creation impossible`;
                        return res.status(500).json({message, data: error.message})
                    })
                }

            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({message, data: error.message})
            })

        }
    );
}