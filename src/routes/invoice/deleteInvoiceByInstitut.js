const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');


module.exports = (app) => {

    app.delete('/api/instituts/:institut_id/sessions/:session_id/users/:user_id/invoices', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const institutId = req.params.institut_id;
            const sessionId = req.params.session_id;
            const userId = req.params.user_id;
            const invoice = await models['Invoice'].findOne({
                where: {
                    institut_id: institutId,
                    session_id: sessionId,
                    user_id: userId
                }
            })

            if(!invoice) {
                return res.status(200).json({message: "no invoice found", data: null})
            } else {
                await invoice.destroy();
                await models['InvoiceLines'].destroy({
                    where: {
                        invoice_id: invoice.invoice_id
                    }
                  });
                return res.status(200).json({message: `invoice ${invoice.invoice_id} has been deleted`, data: invoice})
            }
        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }
    });



    /**
     * Suppression des factures possible uniquement par le super admin get-skills
     */
    app.delete('/api/invoices/:invoice_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            // constantes
            const invoiceId = req.params.invoice_id;

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