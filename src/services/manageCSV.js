const path = require("path");
const fs = require("fs");


/**
 * Envoyer le CSV dans la réponse HTTP
 * @param {String} filename 
 * @param {Res} responseHttp 
 */
function reponseHTTPWithCsv(filename, responseHttp) {
    const fileNameURI = encodeURIComponent(`session.csv`);
    responseHttp.setHeader('Content-Type', "text/csv");
    responseHttp.setHeader('Content-Disposition', `attachment; filename="${fileNameURI}"`);
    const csvFile = fs.createReadStream(path.join(__dirname, 'temporary', filename));
    csvFile.pipe(responseHttp);
}

module.exports = { reponseHTTPWithCsv }