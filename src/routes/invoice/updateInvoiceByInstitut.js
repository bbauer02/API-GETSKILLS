const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');


module.exports = (app) => {
    /**
     * Mise à jour de la facture PAYEE ou IMPAYEE. Possible par les Super Admins Get-Skills uniquement.
     */
    app.put('/api/invoices/:invoice_id', isAuthenticated, isAuthorized, async (req, res) => {

        // constantes
        const invoiceId = req.params.invoice_id;
        const isPaid = req.body.isPaid;

        try {

            const invoice = await models['Invoice']
                .findByPk(invoiceId, {include: {as: 'lines', model: models.InvoiceLines}})

            if(!invoice) {
                return res.status(500).json({message: "no invoice found", data: null})
            } else {
                invoice.isPaid = isPaid;
                await invoice.save();

                return res.status(200).json({message: `invoice numero ${invoice.invoice_id} has been updated`, data: invoice})
            }

        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }

    });
}