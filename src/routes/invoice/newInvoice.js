const { REQ_FACTURE, Requete} = require("../../services/manageQueryDocs");

/**
 * Obtenir les données pour valider la commande avant la facture
 * @param app
 */
module.exports = (app) => {
    app.get('/api/instituts/:institut_id/session/:session_id/orders', async (req, res) => {

        const institutId = req.params.institut_id;
        const sessionId = req.params.session_id;

        try {
            const orderDatas = await Requete(REQ_FACTURE(institutId, sessionId), 'facture');

            if (orderDatas.length === 0) {
                return res.status(200).json({message: 'no facture generated', data: null});
            }

            const order = {
                date_session: orderDatas[0].DATE_START,
                test: orderDatas[0].TEST + " " + orderDatas[0].LEVEL ,
                price_total_TTC: orderDatas.reduce((prev, curr) => {
                    return prev + curr.TOTAL_TTC;
                }, 0),
                lines : orderDatas.reduce((prev, curr) => {
                    return [...prev, {
                        label: curr.DESCRIPTION,
                        quantity: curr.QUANTITY,
                        tva: curr.TVA,
                        price_pu_ttc: curr.PU
                    }]
                }, [])
            }

            return res.status(200).json({message: 'facture', data: order})

        } catch (e) {
            return res.status(500).json({message: 'error:' + e.message, data: null});
        }

    });
}