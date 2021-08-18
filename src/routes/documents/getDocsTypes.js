const DOC_TYPES = [
    "Facture", "Convocation", "Dossier de candidature", "Attestation", "Diplôme"
]

module.exports = (app) => {
    app.get('/api/docs/filetypes', async (req, res) => {
        return res.status(200).json({message: "doc types", data: DOC_TYPES});
    });
}