const sequelize = require("../../db/sequelize");
const {models} = require("../../models");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');


module.exports = (app) => {

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