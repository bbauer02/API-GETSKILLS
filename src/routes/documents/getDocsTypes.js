const DOC_TYPES = require("./index");
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/filetypes', async (req, res) => {
        return res.status(200).json({message: "documents types", data: DOC_TYPES});
    });
}

