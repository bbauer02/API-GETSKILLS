const {models} = require("../../models");

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/order/:order_id', async (req, res) => {

        // constantes
        const institutId = req.params.institut_id;
        const orderId = req.params.order_id;
        const isPaid = req.body.isPaid;

        try {

            const invoice = await models['Invoice'].findByPk(orderId)

            if(!invoice) {
                return res.status(500).json({message: "no invoice found", data: null})
            } else {
                invoice.isPaid = isPaid;
                await invoice.save();

                return res.status(200).json({message: `invoice ${invoice.invoice_id} has been updated`, data: invoice})
            }

        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }

    });
}