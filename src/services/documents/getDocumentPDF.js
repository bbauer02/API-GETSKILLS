const {models} = require("../../models");
const path = require("path");
const fs = require("fs").promises;
const createReadStream = require('fs').createReadStream;
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { deleteTempRepository,createTempRepository,getFilesInTemporaryFolder } = require('../documents/fileSystemManager');
/**
 * Fonction qui permet de récupérer le chemin du fichier de template d'un document.
 * @param {integer} documentId L'identifiant du document.
 * @returns Le chemin du fichier de template
 */
async function getTemplateFile(documentId) {
  let docxTemplate = await models['Document'].findByPk(documentId, {attributes: ['filepath']});
  if (!docxTemplate)
    throw new Error('no template found');
  return docxTemplate.dataValues.filepath;
}
/**
 * Cette fonction permet de générer un PDF en fonction des données récoltées et d'un template DOCX.
 * @param {object} datas un objet contenant les données utiles à la génération du document.
 * @param {integer} documentId L'identifiant du document servant de template.
 */
async function getDocumentPDF (datas, documentId) {
try {
    // récupération du template 
    const docxTemplate = await getTemplateFile(documentId);

    // Suppression de l'ancien répertoire TEMP
    await deleteTempRepository(documentId);
    // création du dossier temporaire dans lequel on met les PDF générés
    const folder = await createTempRepository(documentId);
    // Chargement du fichier DOCX en contenu Binaire
    const content = await fs.readFile(
      path.resolve("public/templates", docxTemplate),
      "binary"
    ); 
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: function (tag) {
          // tag is the string "user", or whatever you have put inside the
          // brackets, eg if your tag was {a==b}, then the value of tag would be
          // "a==b"
          if(tag=== "$pageBreakExceptLast") {
              return {
                get(scope, context) {
                    const totalLength =
                        context.scopePathLength[
                            context.scopePathLength.length - 1
                        ];
                    const index =
                        context.scopePathItem[
                            context.scopePathItem.length - 1
                        ];
                    const isLast = index === totalLength - 1;
                    if (!isLast) {
                        return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
                    } else {
                        return "";
                    }
                },
              };
          }
          return {
              get: function (scope) {
                  // scope will be {user: "John"}
                  if (tag === ".") {
                      return scope;
                  } else {
                      // Here we return the property "user" of the object {user: "John"}
                      return scope[tag];
                  }
              },
          };
      }
    });

    doc.render(datas);
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      // compression: DEFLATE adds a compression step.
      // For a 50MB output document, expect 500ms additional CPU time
      compression: "DEFLATE",
    });
    const timestamp = Math.round(new Date().getTime() / 1000);
    const tempFileName = `${timestamp}`;
    await fs.writeFile(path.resolve(folder, `${tempFileName}.docx`), buf);
  
    // convertion du fichier généré en PDF
    const inputPath = path.join(folder, `${tempFileName}.docx`);
    const outputPath = path.join(folder, `${tempFileName}.pdf`);
    // Read file
    const docxBuf = await fs.readFile(inputPath);
    
    // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
    let pdfBuf = await libre.convertAsync(docxBuf, ".pdf", undefined);
    await fs.writeFile(outputPath, pdfBuf);
    const stream = createReadStream(outputPath);
    return stream;
  }
  catch(err){
    console.log(err)
    throw new Error('Erreur dans la création du PDF');
  }
}

module.exports = { getDocumentPDF }