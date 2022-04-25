const del = require("del");
const fs = require("fs").promises;
const path = require("path");
/**
 * Supprime un répertoire temporaire `temp` du répertoire courant
 * 
 */
async function deleteTempRepository (documentId) {
  try {
      await del(path.join(__dirname+"/temp", ""+documentId));
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * Créer un répertoire temporaire `temp` dans le répertoire courant
 * @returns Le chemin du répertoire `temp`
 */
async function createTempRepository (documentId) {
  try {
      await fs.mkdir(path.join(__dirname+"/temp", ""+documentId));
      return path.join(__dirname+"/temp",  ""+documentId);
  } catch (e) {
      throw new Error('An error occured when trying to create temporary folder. \n' + e.message);
  }
}

/**
 * Obtenir la liste des fichiers PDF créés dans le dossier
 * @returns {string[]}
 */
async function getFilesInTemporaryFolder (documentId) {
  try {
      return await fs.readdir(path.join(__dirname+'/temp', ""+documentId))
  } catch (err) {
      throw new Error('Error on get PDF from temporary folder : ' + err.message)
  }
}

module.exports = { deleteTempRepository, createTempRepository,getFilesInTemporaryFolder}