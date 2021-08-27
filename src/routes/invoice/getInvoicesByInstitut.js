const {models} = require("../../models");
module.exports = (app) => {
    app.get('/api/instituts/:institut_id/orders', async (req, res) => {


        // constantes
        const institutId = req.params.institut_id;

        try {
            const invoices = await models['Invoice'].findAndCountAll(
                {
                    where: {institut_id: institutId},
                    include: { as: 'lines', model: models.InvoiceLines}
                });

            if (invoices.count === 0) {
                return res.status(400).json({message: "error: no invoices found", data: null})
            } else {
                return res.status(200).json({message: `${invoices.count} invoices found.`, data: invoices.rows});
            }

        } catch (e) {
            return res.status(500).json({message: "error: " + e.message, data: null})
        }
    });
}