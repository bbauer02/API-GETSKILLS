/**
 * Conserver facture en position 0
 * @type {string[]}
 */
const DOC_TYPES = [
    "Facture", "Dossier Candidat", "Attestation d'inscription", "Convocation", "Attestation de présence"
]

module.exports = (app) => {
    app.get('/api/docs/filetypes', async (req, res) => {
        return res.status(200).json({message: "doc types", data: DOC_TYPES});
    });
}

