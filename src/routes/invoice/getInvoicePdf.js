const {ConstructDatasForPDf} = require("../../services/manageQueryDocs");
const {
    createRepository,
    destroyTemporaryFolders,
    getFilesInTemporaryFolder
} = require("../../services/manageFileSystem");
const {createPdf, mergePdf} = require("../../services/managePDF");
const fs = require("fs");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const path = require("path");
const DOC_TYPES = require("../documents/index");
const {createPdfWithTemplate, reponseHTTPWithPdf} = require("../../services/managePDF");
const {ConstructDatasForInvoiceInPDF} = require("../../services/manageQueryDocs");

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
                    ['invoice_id', 'NUM_FACTURE'],
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

            let articleLine = {
                DESCRIPTIONS: '',
                QUANTITES: '',
                ARTICLES_PU: '',
                ARTICLES_HT: '',
                ARTICLES_TVA: '',
                ARTICLES_TTC: '',
                TOTAL_HT: 0,
                TOTAL_TVA: 0,
                TOTAL_TTC: 0,
                LIST_TVA: '',
                LIST_HT: '',
                LIST_TTC: ''
            }

            let datasForPdf = invoice.dataValues.lines.reduce((prev, curr) => {
                // retours chariots
                const RC = "\n";
                const RC2 = "\n\n";
                let carriage = RC;

                if (curr.label.length < 40) {
                    prev.DESCRIPTIONS += curr.label + RC;
                } else if (curr.label.length >= 40 && curr.label.length < 80) {
                    carriage = RC2;
                    prev.DESCRIPTIONS += curr.label.substr(0, 79) + RC;
                } else {
                    carriage = RC2;
                    prev.DESCRIPTIONS += curr.label.substr(0, 79) + '...' + RC;
                }

                prev.QUANTITES += curr.quantity + carriage;
                prev.ARTICLES_PU += curr.price_pu_ttc + carriage;
                prev.ARTICLES_TVA += curr.tva + carriage;
                prev.ARTICLES_HT += ((curr.quantity * curr.price_pu_ttc) / (1 + (curr.tva / 100))).toFixed(2) + carriage;
                prev.ARTICLES_TTC += (curr.price_pu_ttc * curr.quantity) + carriage;
                prev.TOTAL_HT += ((curr.quantity * curr.price_pu_ttc) / (1 + (curr.tva / 100)));
                prev.TOTAL_TVA += (curr.quantity * curr.price_pu_ttc) * (1 - (1 / (1 + (curr.tva / 100))));
                prev.TOTAL_TTC += curr.quantity * curr.price_pu_ttc;

                return prev;
            }, articleLine)

            datasForPdf = {
                ...datasForPdf,
                NUM_FACTURE: new Date(invoice.dataValues.DATE_FACTURE).toLocaleString([], {
                    year: 'numeric',
                    month: 'numeric',
                }) + "-" + invoice.dataValues.NUM_FACTURE.toString().padStart(6, "0"),
                REFERENCE: invoice.dataValues.REFERENCE,
                DATE_FACTURE: Math.ceil(Math.abs(invoice.dataValues.DATE_FACTURE - (new Date('1899-12-31'))) / (1000 * 60 * 60 * 24)),
                SCHOOL_NAME: invoice.dataValues.Institut.dataValues.SCHOOL_NAME,
                SCHOOL_ADDRESS1: (invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS2) ? invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS1 + "\n" + invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS2 : invoice.dataValues.Institut.dataValues.SCHOOL_ADDRESS1,
                SCHOOL_ZIPCODE: invoice.dataValues.Institut.dataValues.SCHOOL_ZIPCODE,
                SCHOOL_CITY: invoice.dataValues.Institut.dataValues.SCHOOL_CITY,
                SCHOOL_PHONE: invoice.dataValues.Institut.dataValues.SCHOOL_PHONE,
                SCHOOL_EMAIL: invoice.dataValues.Institut.dataValues.SCHOOL_EMAIL,
            }

            const listTva = invoice.dataValues.lines.reduce((prev, curr) => {
                if (!prev.includes(curr.tva)) {
                    prev.push(curr.tva);
                }
                return prev;
            }, []);

            datasForPdf = {
                ...datasForPdf,
                LIST_TVA: listTva.reduce((prev, curr) => prev + curr.toFixed(2) + "\n", ''),
            }

            datasForPdf = {...datasForPdf, LIST_TTC: '', LIST_HT: ''};
            listTva.forEach((tva) => {
                datasForPdf.LIST_HT += invoice.dataValues.lines
                        .filter((line) => line.tva === tva)
                        .reduce((prev, curr) => prev + ((curr.price_pu_ttc * curr.quantity) / (1 + (tva / 100))), 0)
                        .toFixed(2)
                    + "\n"

                datasForPdf.LIST_TTC += invoice.dataValues.lines
                        .filter((fact) => fact.tva === tva)
                        .reduce((prev, curr) => prev + (curr.price_pu_ttc * curr.quantity), 0)
                        .toFixed(2)
                    + "\n"
            })

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
                reponseHTTPWithPdf(path.join(files[0]), res)
            }


        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });
}
