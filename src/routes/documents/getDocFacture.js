const fs = require("fs");
const {models} = require("../../models");
const unoconv = require('unoconv-promise');
const sequelize = require("../../db/sequelize");
const {QueryTypes} = require("sequelize");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const PDFMerger = require('pdf-merger-js');
const path = require("path");
const del = require("del");

/**
 * Permet de lancer une requete
 * @param reqString
 * @param name
 * @returns {Promise<void>}
 * @constructor
 */
async function Requete (reqString, name) {
    let items = [];
    try {
        items = await sequelize.query(reqString, {type: QueryTypes.SELECT});
    } catch (err) {
        throw new Error("An error occurred. Try to another id or POST one " + name + " - " + err.message)
    }

    if (!items) {
        throw new Error(name + " not found");
    } else {
        return items;
    }
}

/**
 * Construction d'un répertoire de données
 * @param institut
 * @param session
 * @param users
 * @param exams
 * @returns {Promise<void>}
 */
function ConstructDatasForPDf (institut, session, users, exams) {
    // console.log('institut->', institut);
    // console.log('session->', session);
    // console.log('users->', users);
    // console.log('exams->', exams);

    let datasForPdf = [];

    users.forEach((user, index) => {
        const examens = exams.filter((exam) => exam.USER_ID === user.USER_ID);
        let data = Object.assign(session, institut, user);
        let obj = "";
        examens.forEach((examen) => {
            obj += "\u2022 " + examen.EXAM + "\n";
        })
        data = Object.assign(data, {EXAM_0: obj});
        datasForPdf = [...datasForPdf, {...data}];
    })
    return datasForPdf;
}

/**
 * Récupération du document souhaité
 * @param documentId
 * @returns {Promise<void>}
 */
async function getDocument (documentId) {
    let document = null;
    try {
        document = await models['Document'].findByPk(documentId);
    } catch (err) {
        throw new Error("An error occurred. Try to another id document or POST one document." + err.message)
    }

    if (!document) {
        throw new Error("Document not found for id=" + documentId)
    } else {
        return document.dataValues.filepath;
    }
}

/**
 * Fonction de création d'un pdf
 * @param odtTemplate
 * @param folder
 * @param datasForPdf
 * @returns {Promise<void>}
 */
async function createPdf (odtTemplate, folder, datasForPdf) {
    let index = 0;
    for (const data of datasForPdf) {
        try {
            await unoconv.run({
                file: odtTemplate,
                fields: data,
                output: folder + '/temp-' + index + ".pdf"
            })
        } catch (err) {
            throw new Error("An error occurred when pdf is genereated. " + err.message)
        }

        index += 1;
    }
}

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
 * Obtenir la liste des fichiers PDF créés dans le dossier
 * @param folder
 * @returns {string[]}
 */
function getPdfCreated (folder) {
    try {
        return fs.readdirSync(folder)
    } catch (err) {
        throw new Error('Error on get PDF from temporary folder : ' + err.message)
    }
}

/**
 * Fusionner des PDF
 * @param files
 * @returns {Promise<string>}
 */
async function mergePdf (files) {
    try {
        const merger = new PDFMerger();

        for await (const fileName of files) {
            merger.add(path.join(__dirname, 'temporary', fileName));
        }

        await merger.save(path.join(__dirname, 'temporary', 'merged.pdf'));

        return 'merged.pdf';

    } catch (error) {
        throw new Error('Error during merge pdf files : ' + error.message)
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



module.exports = (app) => {
    app.get('/api/instituts/:institut_id/documents/:doc/download/', async (req, res) => {

        const documentId = req.params.doc;
        const institutId = req.params.institut_id;
        const sessionId = req.query.session_id;

        /**
         * Envoyer le PDF dans la réponse HTTP
         * @param pdfFile
         */
        function reponseHTTPWithPdf (pdfFile) {
            const s = fs.createReadStream(pdfFile);
            const myFilename = encodeURIComponent("myDocument.pdf");
            res.setHeader('Content-disposition', 'inline; filename="' + myFilename + '"');
            res.setHeader('Content-Type', "application/pdf");
            s.pipe(res);
        }

        try {

            // requetes
            const instituts = await Requete(REQ_INSTITUT(institutId), 'institut');
            const sessions = await Requete(REQ_SESSION(sessionId), 'session');
            const users = await Requete(REQ_USERS(sessionId), 'users');
            const exams = await Requete(REQ_EXAMS(sessionId), 'exams');

            // destruction du dossier temporaire si existant
            await destroyTemporaryFolders();

            // création d'un tableau d'objets contenant toutes les infos
            const datasForPdf = ConstructDatasForPDf(instituts[0], sessions[0], users, exams);

            // récupération du template oo
            const odtTemplate = await getDocument(documentId);

            // récupération du dossier du
            const folder = createRepository();

            // création des pdf en boucle sur les données construites
            await createPdf(odtTemplate, folder, datasForPdf);

            // récupération des fichiers PDF qui ont été générés
            const files = getPdfCreated(path.join(__dirname, 'temporary'))

            // pas de fichier PDF trouvés
            if (files.length === 0) {
                throw new Error('No PDF files created.')
            }

            // 1 fichier PDF généré
            if (files.length === 1) {
                reponseHTTPWithPdf(path.join(__dirname, 'temporary', files[0]))
            }

            // plusieurs fichiers PDF à fusionner ensemble
            if (files.length > 1) {
                const pdfFileNameMerged = await mergePdf(files);
                reponseHTTPWithPdf(path.join(__dirname, 'temporary', pdfFileNameMerged))
            }


        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }

    });
}


/**
 * obtenir un institut avec son id
 * @param institutId
 * @returns {string}
 * @constructor
 */
const REQ_INSTITUT = (institutId) => {
    let requete = "SELECT ";
    requete += "instituts.label as SCHOOL_NAME, instituts.label as SCHOOL_NAME_PIED, ";
    requete += "instituts.adress1 as SCHOOL_ADDRESS1, instituts.adress1 as SCHOOL_ADDRESS1_PIED, ";
    requete += "instituts.adress2 as SCHOOL_ADDRESS2, instituts.adress2 as SCHOOL_ADDRESS2_PIED, ";
    requete += "instituts.zipcode as SCHOOL_ZIPCODE, instituts.zipcode as SCHOOL_ZIPCODE_PIED, ";
    requete += "instituts.city as SCHOOL_CITY, instituts.city as SCHOOL_CITY_PIED, ";
    requete += "instituts.phone as SCHOOL_PHONE, instituts.phone as SCHOOL_PHONE_PIED, ";
    requete += "instituts.email as SCHOOL_EMAIL, instituts.email as SCHOOL_EMAIL_PIED ";
    requete += "FROM instituts ";
    requete += "WHERE instituts.institut_id = " + institutId;
    return requete;
}

/**
 * obtenir une session par son id
 * @param sessionId
 * @returns {string}
 * @constructor
 */
const REQ_SESSION = (sessionId) => {
    let requete = "SELECT ";
    requete += "DATE_FORMAT(sessions.start, '%d %M %Y') as SESSION_START_DATE, ";
    requete += "DATE_FORMAT(sessions.start, '%Hh%i') as SESSION_START_HOUR, ";
    requete += "IFNULL(levels.label, '') as LEVEL, ";
    requete += "tests.label as TEST ";
    requete += "FROM sessions "
    requete += "join tests on tests.test_id = sessions.test_id ";
    requete += "left join exams on tests.test_id = exams.test_id ";
    requete += "left join levels on exams.level_id = levels.level_id ";
    requete += "where sessions.session_id = " + sessionId;
    return requete
}

/**
 * Obtenir la liste des candidats pour la session
 * @param sessionId
 * @returns {string}
 * @constructor
 */
const REQ_USERS = (sessionId) => {
    let requete = "SELECT ";
    requete += "case users.civility WHEN 1 THEN 'Mister' WHEN 2 THEN 'Miss' ELSE '' END as USER_GENDER, ";
    requete += "users.user_id as USER_ID, ";
    requete += "users.lastname as USER_LASTNAME, ";
    requete += "users.firstname as USER_FIRSTNAME, ";
    requete += "users.adress1 as USER_ADRESS1, ";
    requete += "users.adress2 as USER_ADRESS2, ";
    requete += "users.zipcode as USER_ZIPCODE, ";
    requete += "users.city as USER_CITY, ";
    requete += "users.phone as USER_PHONE, ";
    requete += "users.email as USER_MAIL, ";
    requete += "DATE_FORMAT(users.birthday, '%d %M %Y') as USER_BIRTHDAY, ";
    requete += "countries.label as USER_COUNTRY ";
    requete += "from users ";

    requete += "join sessionUsers on sessionUsers.user_id = users.user_id ";
    requete += "join sessions on sessions.session_id = sessionUsers.session_id ";
    requete += "join countries on countries.country_id = users.country_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "order by user_id";
    return requete;
}

/**
 * Obtenir la liste des épreuves pour la session
 * @param sessionId
 * @returns {string}
 * @constructor
 */
const REQ_EXAMS = (sessionId) => {
    let requete = "SELECT ";
    requete += "users.user_id as USER_ID, ";
    requete += "exams.label as EXAM, ";
    requete += "session_user_option.isCandidate as EXAM_IS_CANDIDATE, ";
    requete += "session_user_option.DateTime as USER_DATE_INSCRIPTION ";
    requete += "from sessions "
    requete += "join tests on tests.test_id = sessions.test_id ";
    requete += "left join exams on tests.test_id = exams.test_id ";
    requete += "left join levels on exams.level_id = levels.level_id ";
    requete += "join sessionUsers on sessionUsers.session_id = sessions.session_id ";
    requete += "join session_user_option on session_user_option.exam_id = exams.exam_id ";
    requete += "join users on sessionUsers.user_id = users.user_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "order by user_id";
    return requete
}