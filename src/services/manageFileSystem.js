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
 * Création d'un dossier dans le dossier PUBLIC.
 */
function createRepositoryWithName (title) {
    try {
        fs.mkdirSync(path.join(process.cwd(), 'public', title));
        console.log(path.join(process.cwd(), 'public', title), "folder has been created successfully.");
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
 * Détruire les fichiers/dossiers dans public avec son nom
 * @returns {Promise<void>}
 */
async function destroyFolder (title) {
    try {
        await del(path.join(process.cwd(), 'public', title));
        console.log(path.join(process.cwd(), 'public', title),"has been destroyed!");
    } catch (e) {
        throw new Error(title + ' does not exists. \n' + e.message);
    }
}

/**
 * Obtenir la liste des fichiers PDF créés dans le dossier
 * @returns {string[]}
 */
function getFilesInTemporaryFolder () {
    try {
        return fs.readdirSync(path.join(__dirname, 'temporary'))
    } catch (err) {
        throw new Error('Error on get PDF from temporary folder : ' + err.message)
    }
}

module.exports = {getFilesInTemporaryFolder, destroyTemporaryFolders, createRepository, createRepositoryWithName, destroyFolder}