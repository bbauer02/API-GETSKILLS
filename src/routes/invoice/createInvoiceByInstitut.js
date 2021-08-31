const {models} = require("../../models");

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/orders', async (req, res) => {

        let index = 0;

        // constantes
        const institutId = req.params.institut_id;
        const order = req.body;
        const lines = req.body.lines;

        try {
            let orderCreated = await models['Invoice'].create(order);
            for(const line of lines) {
                await models['InvoiceLines'].create({...line, num_line: ++index, invoice_id: orderCreated.invoice_id});
            }
            if(!orderCreated) {
                return res.status(400).json({message: 'Error: no invoice created', data: null})
            }
            const invoice = await models['Invoice'].findOne(
                {
                    where: {invoice_id: orderCreated.invoice_id},
                    include: { as: 'lines', model: models.InvoiceLines}
                });
            return res.status(200).json({message: `invoice for session ${orderCreated.ref_client} has been created.`, data: invoice});
        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }
    })
}