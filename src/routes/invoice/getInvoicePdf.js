const DOC_TYPES = require("../documents");
const {getDocumentPDF, reponseHTTPWithPdf} = require("../../services/managePDF");
const {FieldsForInvoice} = require("../../services/manageQueryDocs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
 
    /**
     * Génération du PDF de la facture des sessions pour les écoles.
     */

    async function getInvoice(req, res) {
        try {

            let invoice_id;
            let institut_id;
            let session_id;
            let user_id;
            let where;

            if(req.params.invoice_id && req.params.institut_id) {
                invoice_id = +req.params.invoice_id;
                institut_id = +req.params.institut_id;

                where = {
                    invoice_id,
                    institut_id
                }
            }
            else if(req.params.session_id && req.params.user_id && req.params.institut_id) {
                session_id = +req.params.session_id;
                user_id = +req.params.user_id;
                institut_id = +req.params.institut_id;

                where = {
                    session_id,
                    user_id,
                    institut_id
                }
            }
            


           const invoice =  await models['Invoice'].findOne({
                where,
                include: [
                    {
                        model: models['InvoiceLines'],
                        as: 'lines',
                        required: false
                    },
                    {
                        model: models['Institut'],
                        include:
                            [
                                {
                                    attributes: [['label', 'label']],
                                    model: models['Country'],
                                    as: 'institutCountry'
                                },
                            ]
                    }
                ]
            });

            return res.status(200).json({message: `invoice found.`, invoice});

        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }
    }

    app.get('/api/instituts/:institut_id/invoices/:invoice_id', isAuthenticated, isAuthorized, async (req, res) => {
        await getInvoice(req, res);
    });

    app.get('/api/instituts/:institut_id/sessions/:session_id/users/:user_id/invoices', isAuthenticated, isAuthorized, async (req, res) => {
        await getInvoice(req, res);
    });
}
