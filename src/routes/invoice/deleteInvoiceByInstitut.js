const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');


module.exports = (app) => {
    /**
     * Suppression des factures possible uniquement par le super admin get-skills
     */
    app.delete('/api/invoices/:invoice_id', isAuthenticated, isAuthorized, async (req, res) => {

        // constantes
        const invoiceId = req.params.invoice_id;

        try {

            const invoice = await models['Invoice'].findByPk(invoiceId)

            if(!invoice) {
                return res.status(500).json({message: "no invoice found", data: null})
            } else {
                await invoice.destroy();
                return res.status(200).json({message: `invoice ${invoice.invoice_id} has been deleted`, data: invoice})
            }

        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }

    });
}