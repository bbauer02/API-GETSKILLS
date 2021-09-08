const DOC_TYPES = require("../documents");
const {getDocumentPDF, reponseHTTPWithPdf} = require("../../services/managePDF");
const {FieldsForInvoice} = require("../../services/manageQueryDocs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {

    async function getInvoice (invoiceId) {

        return await models['Invoice'].findOne({
            where: {invoice_id: invoiceId},
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
        })
    }

    async function generateInvoiceInPDF (invoiceId) {
        // création d'un tableau d'objets contenant toutes les infos
        const invoice = await getInvoice(invoiceId);

        return [new FieldsForInvoice(invoice)];
    }


    /**
     * Génération du PDF de la facture des sessions pour les écoles.
     */
    app.get('/api/instituts/:institut_id/invoices/:invoice_id/download', isAuthenticated, isAuthorized, async (req, res) => {

        const invoiceId = parseInt(req.params.invoice_id);

        try {

            const datasForPdf = await generateInvoiceInPDF(invoiceId);

            const document = await models['Document'].findOne({
                where: {institut_id: null, doctype: DOC_TYPES.findIndex("Facture") }
            })

            const files = await getDocumentPDF(datasForPdf, document.document_id);

            // pas de fichier PDF trouvés
            if (files.length === 0) {
                throw new Error('No PDF files created.')
            }

            // 1 fichier PDF généré
            if (files.length === 1) {
                reponseHTTPWithPdf(files[0], res, true)
            }

        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });

    /**
     * Génération du PDF de al facture des sessions pour Get-skills vers les écoles
     */
    app.get('/api/invoices/:invoice_id/download', isAuthenticated, isAuthorized, async (req, res) => {

        const invoiceId = parseInt(req.params.invoice_id);

        try {

            const datasForPdf = await generateInvoiceInPDF(invoiceId);

            // todo: docuementid
            const files = await getDocumentPDF(datasForPdf, 1);

            // pas de fichier PDF trouvés
            if (files.length === 0) {
                throw new Error('No PDF files created.')
            }

            // 1 fichier PDF généré
            if (files.length === 1) {
                reponseHTTPWithPdf(files[0], res, true)
            }

        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }
    })
}
