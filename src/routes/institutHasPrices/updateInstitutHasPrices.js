const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/exams/price', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const priceId = req.body.price_id;
        const price = req.body.price;
        const isAdmin = req.body.isAdmin;

        // mettre à jour l'épreuve
        await models['InstitutHasPrices'].findOne({
            where: {price_id: priceId}
        }).then(function (examPriceFound) {
            if (examPriceFound) {
                // le prix existe déjà
                examPriceFound.update(
                    {price: price},
                    {isAdmin: isAdmin},
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
        });
    })
}