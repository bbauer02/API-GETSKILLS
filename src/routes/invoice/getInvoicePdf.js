
const {formaterLaFacture} = require("../../services/manageQueryDocs");
const {
    createRepository,
    destroyTemporaryFolders,
    getFilesInTemporaryFolder
} = require("../../services/manageFileSystem");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const {createPdfWithTemplate, reponseHTTPWithPdf} = require("../../services/managePDF");

const STANDARD_INVOICE = process.cwd() + '/public/templates/Standard_facture_cifle.odt';

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/invoice/:invoice_id/download', async (req, res) => {

        const invoiceId = parseInt(req.params.invoice_id);
        const institutId = parseInt(req.params.institut_id);

        try {

            // destruction du dossier temporaire si existant
            await destroyTemporaryFolders();

            // création d'un tableau d'objets contenant toutes les infos
            const invoice = await models['Invoice'].findOne({
                where: {invoice_id: invoiceId, institut_id: institutId},
                attributes: [
                    ['invoice_id', 'invoiceId'],
                    ['reference', 'ref'],
                    ['ref_client', 'REFERENCE'],
                    ['createdAt', 'DATE_FACTURE'],
                ],
                include: [
                    {
                        model: models['InvoiceLines'],
                        as: 'lines',
                        required: false
                    },
                    {
                        model: models['Institut'],
                        required: true,
                        attributes: [
                            ['label', 'SCHOOL_NAME'],
                            ['adress1', 'SCHOOL_ADDRESS1'],
                            ['adress2', 'SCHOOL_ADDRESS2'],
                            ['zipcode', 'SCHOOL_ZIPCODE'],
                            ['city', 'SCHOOL_CITY'],
                            ['phone', 'SCHOOL_PHONE'],
                            ['email', 'SCHOOL_EMAIL'],
                        ]
                    }
                ]
            })

            let datasForPdf = {
                NUM_FACTURE: invoice.dataValues.ref + "-" + invoice.dataValues.invoiceId.toString().padStart(6, "0"),
                REFERENCE: invoice.dataValues.REFERENCE,
                DATE_FACTURE: Math.ceil(Math.abs(invoice.dataValues.DATE_FACTURE - (new Date('1899-12-31'))) / (1000 * 60 * 60 * 24)),
                SCHOOL_NAME: invoice.dataValues.Institut.dataValues.SCHOOL_NAME,
                SCHOOL_ADDRESS1: (invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS2) ? invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS1 + "\n" + invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS2 : invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS1,
                SCHOOL_ZIPCODE: invoice.dataValues.Institut.dataValues.SCHOOL_ZIPCODE,
                SCHOOL_CITY: invoice.dataValues.Institut.dataValues.SCHOOL_CITY,
                SCHOOL_PHONE: invoice.dataValues.Institut.dataValues.SCHOOL_PHONE,
                SCHOOL_EMAIL: invoice.dataValues.Institut.dataValues.SCHOOL_EMAIL,
            }

            const invoiceDatas = formaterLaFacture(invoice.dataValues.lines);

            datasForPdf = Object.assign(datasForPdf, invoiceDatas);


            // création du dossier temporaire dans lequel on met les PDF générés
            const folder = createRepository();

            // création des pdf en boucle sur les données construites
            await createPdfWithTemplate(STANDARD_INVOICE, folder, [datasForPdf]);

            // récupération des fichiers PDF qui ont été générés
            const files = getFilesInTemporaryFolder();

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
}
