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
            return res.status(200).json({message: `invoice for session ${orderCreated.nature} has been created.`, data: orderCreated});

            if(order) {
                return res.status(400).json({message: 'Error: no invoice created', data: null})
            }

        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }
    })
}