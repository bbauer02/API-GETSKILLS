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
                if (institut === null) {
                    const message = `institut doesn't exist. Retry with an other institut id.`;
                    return res.status(404).json({message});
                }

                // vérifier l'exam
                const exam = await models['Exam'].findOne({
                    where: {exam_id: institutId}
                })
                if (exam === null) {
                    const message = `exam doesn't exist. Retry with an other exam id.`;
                    return res.status(404).json({message});
                }
            } catch (error) {
                const message = `Service not available. Please retry later.`;
                res.status(500).json({message, data: error.message})
            }

            // récupérer l'examen
            await models['ExamsPrice'].findOne({
                where: {institut_id: institutId, exam_id: examId}
            }).then(function (examPriceFound) {
                if (examPriceFound) {
                    // le prix a déjà été défini -> il faut update
                    examPriceFound.update(
                        {price: price}, {
                            where: {
                                institut_id: institutId,
                                exam_id: examId
                            }
                        }
                    ).then(function (examPriceUpdated) {
                        const message = `Price for ${examPriceUpdated.price} coin has been updated.`;
                        return res.status(200).json({message, data: examPriceUpdated})
                    }).catch(function (error) {
                        const message = `Update Price for an exam impossible`;
                        return res.status(500).json({message, data: error.message})
                    })

                } else {
                    // le prix n'a pas été défini -> il faut le créer
                    models['ExamsPrice'].create({
                        institut_id: institutId,
                        exam_id: examId,
                        price: price,
                    }).then(function (examPriceCreated) {
                        const message = `Price for ${examPriceCreated.price} € has been created.`;
                        return res.status(200).json({message, data: examPriceCreated})
                    }).catch(function (error) {
                        const message = `Creation impossible`;
                        return res.status(500).json({message, data: error.message})
                    })
                }

            }).catch(function (err) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({message, data: error.message})
            })

        }
    )
    ;
}