const DOC_TYPES = require("./index");
module.exports = (app) => {
    app.get('/api/docs/filetypes', async (req, res) => {
        return res.status(200).json({message: "doc types", data: DOC_TYPES});
    });
}

