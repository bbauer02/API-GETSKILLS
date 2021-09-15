const {getAllFields, generateLinesInvoiceGetSkillsForItsClients} = require("../../services/manageQueryDocs");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

/**
 * Génération d'une commande. la méthode va rechercher les données concernant une session :
 * [{liste des épreuves, quantité par épreuve, tva, prix unitaire}, ...]
 * ===
 * La méthode permet aussi d'y ajouter des lignes avec addedLines.
 * [{ label, puTtc, tva, qty }, ...]
 * @param institutId
 * @param sessionId
 * @param addedLines [{ label, puTtc, tva, qty }, ...]
 * @returns {Promise<{test: *, date_session, price_total_TTC: number, lines: T[]}>}
 */
async function generateOrder (institutId, sessionId, addedLines = []) {
    // récupération des données de facturation
    const orderDatas = await getAllFields(institutId, sessionId);

    // organisation des données sous forme de lignes d'articles
    // ces lignes contiennent : {nom de l'épreuve, tva, Pu, qty}
    let lines = generateLinesInvoiceGetSkillsForItsClients(orderDatas);
    console.log(orderDatas);
    return {
        DateTime: orderDatas.start,
        test: orderDatas.Test.label + (orderDatas.Level?.label || ''),
        price_total_TTC: lines.reduce((prev, curr) => {
            return prev + (curr.price_pu_ttc * curr.quantity);
        }, 0),
        lines: lines.concat(addedLines), // ajout de lignes supplémentaires pour la facture
    }
}

module.exports = (app) => {

    /**
     * Obtenir les données de facturation d'une session pour une école.
     * Opération de validation de la commande par l'école avant la facturation de la session.
     * OPération effectuée par l'administrateur de l'école en charge de valider les sessions.
     * @param app
     */
    app.get('/api/instituts/:institut_id/sessions/:session_id/orders', isAuthenticated, isAuthorized, async (req, res) => {

        // return res.status(200).json({data: 'route ok'});

        try {

            const institutId = req.params.institut_id;
            const sessionId = req.params.session_id;

            const order = await generateOrder(institutId, sessionId);

            if (!order) {
                return res.status(200).json({message: 'no order generated', data: null});
            }

            return res.status(200).json({message: 'order', data: order})

        } catch (e) {
            return res.status(500).json({message: 'error:' + e.message, data: null});
        }

    });

}