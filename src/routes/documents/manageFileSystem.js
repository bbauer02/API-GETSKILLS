const del = require("del");
const fs = require("fs");
const path = require("path");

/**
 * Création d'un dossier de temporaire qui contient les pdf.
 * @returns {string}
 */
function createRepository () {
    try {
        fs.mkdirSync(path.join(__dirname, 'temporary'));
        console.log("Temporary folder has been created successfully.")
        return path.join(__dirname, 'temporary');
    } catch (e) {
        throw new Error('An error occured when trying to create temporary folder. \n' + e.message);
    }
}

/**
 * Détruire les fichiers/dossiers temporaires
 * @returns {Promise<void>}
 */
async function destroyTemporaryFolders () {
    try {
        await del(path.join(__dirname, 'temporary'));
    } catch (e) {
        console.log(e.message)
    }
}

/**
 * Obtenir la liste des fichiers PDF créés dans le dossier
 * @param folder
 * @returns {string[]}
 */
function getFilesIn (folder) {
    try {
        return fs.readdirSync(folder)
    } catch (err) {
        throw new Error('Error on get PDF from temporary folder : ' + err.message)
    }
}

module.exports = {getFilesIn, destroyTemporaryFolders, createRepository}