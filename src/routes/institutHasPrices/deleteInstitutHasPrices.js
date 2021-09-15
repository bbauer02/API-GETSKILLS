const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.delete('/api/instituts/:institut_id/exams/price', isAuthenticated, isAuthorized, async (req, res) => {

        const priceId = req.body.price_id;

        // détruirel'examen
        await models['InstitutHasPrices'].findOne({
            where: {price_id: priceId}
        }).then(function (examPriceFound) {
            if (examPriceFound) {
                // le prix existe
                models['InstitutHasPrices'].destroy({
                    where: {price_id: priceId}
                }).then(function (examPriceDestroyed) {
                    const message = `Price has been deleted.`;
                    return res.status(200).json({message, data: {price_id: priceId}})
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