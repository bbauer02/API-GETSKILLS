const DOC_TYPES = require("./index");
module.exports = (app) => {
    app.get('/api/instituts/:instituts_id/documents/filetypes', async (req, res) => {
        return res.status(200).json({message: "documents types", data: DOC_TYPES});
    });
}

