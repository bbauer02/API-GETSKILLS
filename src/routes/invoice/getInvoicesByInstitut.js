const {models} = require("../../models");
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {

    /**
     * Requete pour obtenir la liste des factures.
     * @param where
     * @returns {Promise<Model[]>}
     */
    async function getInvoices (where = null) {

        let queryParameter = {
            include: [
                {
                    as: 'lines', 
                    model: models.InvoiceLines.scope('price_ttc'), 
                }
            ]
        };

        if (where)
            queryParameter = {where, ...queryParameter}

        return await models.Invoice.scope('amount_ttc').findAll(queryParameter);

    }


    /**
     * Obtenir la liste des factures entre Get-skills et ses clients en tant que super admin
     */
    app.get('/api/invoices', isAuthenticated, isAuthorized, async (req, res) => {

        try {

            const invoices = await getInvoices();

            if (invoices.length === 0) {
                return res.status(400).json({message: "error: no invoices found", data: null})
            } else {
                return res.status(200).json({message: `${invoices.length} invoices found.`, data: invoices});
            }

        } catch (e) {
            return res.status(500).json({message: "error: " + e.message, data: null})
        }

    })


    /**
     * Obtenir la liste des factures entre Get-skills et l'école en tant que adminisatrateur de l'institut
     */
    app.get('/api/instituts/:institut_id/invoices', isAuthenticated, isAuthorized, async (req, res) => {


        
        try {
            // constantes
            const institutId = parseInt(req.params.institut_id);
            const invoices = await getInvoices({institut_id: institutId});

            if (invoices.length === 0) {
                return res.status(200).json({message: "error: no invoices found", invoices: []})
            } else {
                return res.status(200).json({message: `${invoices.length} invoices found.`, invoices});
            }

        } catch (e) {
            return res.status(500).json({message: "error: " + e.message, data: null})
        }
    });


}