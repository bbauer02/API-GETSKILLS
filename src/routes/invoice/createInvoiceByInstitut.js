const sequelize = require("../../db/sequelize");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const {Invoice} = require('../invoice/invoice.class');


module.exports = (app) => {


    app.post('/api/instituts/:institut_id/sessions/:session_id/users/:user_id/invoices', isAuthenticated, isAuthorized, async (req, res) => {
        
        // On supprime si elle existe les anciennes 
        const institutId = req.params.institut_id;
        const sessionId = req.params.session_id;
        const userId = req.params.user_id;

        const invoice = await models['Invoice'].findOne({
            where: {
                institut_id: +institutId,
                session_id: +sessionId,
                user_id: +userId
            }
        })
        if(invoice) {
            await invoice.destroy();
            await models['InvoiceLines'].destroy({
                where: {
                    invoice_id: +invoice.invoice_id
                }
              });
        }

        // On récupére les informations de base
        const currentUser = await models['User'].findOne({
            where: {
                user_id: +userId
            },
            attributes:{exclude:['password']},

            include: [
                {
                    model: models['Country'],
                    as:'country',
                    attributes : ["label"]
                },
                {
                    model: models['Country'],
                    as:'nationality',
                    attributes : [["countryNationality",'label']]
                },
                {
                    model: models['Language'],
                    as:'firstlanguage',
                    attributes : ['nativeName']
                },
            ]
        });

        // On récupére les sessionUser
        const currentSessionUser =  await models['sessionUser'].findOne( {
            where: {
                session_id: +sessionId,
                user_id: +userId
            }
        });

        const newInvoice = new Invoice(institutId, sessionId, currentUser, currentSessionUser);
        await newInvoice.generateInvoice();

        const _invoice =  await models['Invoice'].findOne( {
            where: {
                invoice_id: newInvoice.invoiceHeader.invoice_id
            },
            include: [
                {
                    as: 'lines', 
                    model: models.InvoiceLines.scope('price_ttc'), 
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

        return res.status(200).json({
                        message: `invoice has been created.`,
                        invoice: _invoice
                    });
    });  
    /**
     * Création d'une facture lors de la validation de la session.
     * Elle est effectuée par les administrateurs des instituts et les super admin.
     */
    app.post('/api/instituts/:institut_id/invoices', isAuthenticated, isAuthorized, async (req, res) => {

        let index = 0;

        // constantes
        const institutId = req.params.institut_id;
        const order = req.body;
        const lines = req.body.lines;

        try {

            const orderCreated = await models['Invoice'].create({
                ...order,
                reference: new Date().getFullYear() + "/" + new Date().getMonth().toString().padStart(2, "0"),
                lines: lines.reduce((prev, curr, index) => {
                    return [...prev, {...curr, num_line: ++index}];
                }, []),
            }, {
                include: {as: 'lines', model: models.InvoiceLines}
            });

            if (!orderCreated) {
                return res.status(400).json({message: 'Error: no invoice created', data: null})
            }

            return res.status(200).json({
                message: `invoice for : ${orderCreated.ref_client} has been created.`,
                data: orderCreated
            });
        } catch (e) {
            return res.status(500).json({message: e.message, data: null})
        }
    })
}