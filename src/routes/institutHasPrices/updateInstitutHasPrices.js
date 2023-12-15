const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/exams/:exam_id/price', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const price = req.body.price;
            const tva = req.body.tva;

            const institutId = parseInt(req.params.institut_id);
            const examId = parseInt(req.params.exam_id);

            // mettre à jour l'épreuve
            const examPriceFound = await models['InstitutHasPrices'].findOne(
            {
                where: {
                    institut_id: institutId,
                    exam_id: examId
                }
            });
            if (examPriceFound) {
                const examPriceCreated = await examPriceFound.update(
                    {
                        price: price,
                        tva: tva
                    },
                    {
                        where: {
                            institut_id: institutId,
                            exam_id: examId
                        }
                    }
                );
                const message = `Price for ${examPriceCreated.price} coin has been updated.`;
                return res.status(200).json({message, price: examPriceCreated})
            }



       /* await models['InstitutHasPrices'].findOne({
            where: {institut_id: institutId,exam_id: examId}
        }).then(function (examPriceFound) {
            if (examPriceFound) {
                // le prix existe déjà
                examPriceFound.update(
                    {price: price},
                    {
                        where: {
                            price_id: priceId
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
        });*/
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        }
    })
}