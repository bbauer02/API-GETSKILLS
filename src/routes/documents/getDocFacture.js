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
 * Construction d'un répertoire de données à partir des requêtes
 * @param institut
 * @param session
 * @param users
 * @param exams
 * @returns {Promise<void>}
 */
function ConstructDatasForPDf (institut, session, users, exams, factures, facturesInfo) {
    // console.log('institut->', institut);
    // console.log('session->', session);
    // console.log('users->', users);
    // console.log('exams->', exams);
    // console.log('factures->', factures);
    // console.log('factures info->', facturesInfo);

    let datasForPdf = [];

    users.forEach((user) => {
        const examens = exams.filter((exam) => exam.USER_ID === user.USER_ID);
        const myFactures = factures.filter((fact) => fact.USER_ID === user.USER_ID);
        const factInfos = facturesInfo.filter((fact) => fact.USER_ID === user.USER_ID);

        let data = Object.assign(session, institut, user);
        let oExams = "";
        let ofact = {};

        examens.forEach((examen) => {
            oExams += "\u2022 " + examen.EXAM + "\n";
        })

        let count = 0;
        myFactures.forEach((line) => {
            count += 1;
            ofact['REFERENCE_LIGNE_' + count]=line.REFERENCE;
            ofact['DESIGNATION_LIGNE_' + count]=line.DESIGNATION;
            ofact['QUANTITY_LIGNE_' + count]=line.QUANTITY;
            ofact['PU_LIGNE_' + count]=line.PU;
            ofact['HT_LIGNE_' + count]=line.HT;
            ofact['TVA_LIGNE_' + count]=line.TVA;
            ofact['TTC_LIGNE_' + count]=line.TTC;
        })

        data = Object.assign(data, {EXAMS: oExams});
        data = Object.assign(data, factInfos[0] );
        data = Object.assign(data, ofact);
        datasForPdf = [...datasForPdf, {...data}];
    })
    console.log(datasForPdf);
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
 * @param outPutFolder
 * @param datasForPdf
 * @returns {Promise<void>}
 */
async function createPdf (odtTemplate, outPutFolder, datasForPdf) {
    let index = 0;

    for (const data of datasForPdf) {
        try {
            await unoconv.run({
                file: odtTemplate,
                fields: data,
                output: outPutFolder + '/temp-' + index + ".pdf"
            })
        } catch (err) {
            throw new Error("An error occurred when pdf is generated. " + err.message)
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
            const factures = await Requete(REQ_FACTURE(sessionId), 'factures');
            const facturesInfo = await Requete(REQ_FACTURE_INFOS(sessionId), 'factures infos');

            // destruction du dossier temporaire si existant
            await destroyTemporaryFolders();

            // création d'un tableau d'objets contenant toutes les infos
            const datasForPdf = ConstructDatasForPDf(instituts[0], sessions[0], users, exams, factures, facturesInfo);

            // récupération du template oo
            const odtTemplate = await getDocument(documentId);

            // création du dossier temporaire dans lequel on met les PDF générés
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
    requete += "DATEDIFF(sessions.start, '1899-12-30') as SESSION_START_DATE, ";
    requete += "(HOUR(sessions.start) * 60 + MINUTE(sessions.start))/1440 as SESSION_START_HOUR, ";
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
    requete += "IFNULL(sessionUsers.numInscrAnt, '-') as USER_NUM_INSCR, "
    requete += "DATEDIFF(users.birthday, '1899-12-30') as USER_BIRTHDAY, ";
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

/**
 * récupérer les prix des examens par utilisateur
 * @param sessionId
 * @returns {string}
 * @constructor
 */
const REQ_FACTURE = (sessionId) => {
    let requete = "SELECT ";
    requete += "sessionUsers.user_id as USER_ID, "
    requete += "' ' as REFERENCE, ";
    requete += "exams.label as DESIGNATION, ";
    requete += "1 as QUANTITY, ";
    requete += "session_user_option.user_price as PU, ";
    requete += "(1 * session_user_option.user_price) as HT, ";
    requete += "20 as TVA, ";
    requete += "((1 * session_user_option.user_price) * (1+(20/100))) as TTC "
    requete += "from session_user_option ";
    requete += "JOIN sessionUsers ON sessionUsers.sessionUser_id = sessionUsers.sessionUser_id ";
    requete += "JOIN exams ON session_user_option.exam_id = exams.exam_id ";
    requete += "JOIN tests ON exams.test_id = tests.test_id ";
    requete += "JOIN sessions ON sessions.test_id = tests.test_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "order by user_id";
    return requete
}
const TVA = 20.00;

const REQ_FACTURE_INFOS = (sessionId) => {
    let requete = "SELECT ";
    requete += "sessionUsers.user_id as USER_ID, ";
    requete += "COUNT(exams.label) as NB_LIGNE, ";
    requete += "SUM(((1 * session_user_option.user_price) * (1+("+TVA+"/100)))) as TOTAL_TTC ";
    requete += "from session_user_option ";
    requete += "JOIN sessionUsers ON sessionUsers.sessionUser_id = sessionUsers.sessionUser_id ";
    requete += "JOIN exams ON session_user_option.exam_id = exams.exam_id ";
    requete += "JOIN tests ON exams.test_id = tests.test_id ";
    requete += "JOIN sessions ON sessions.test_id = tests.test_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "GROUP BY sessionUsers.user_id "
    requete += "order by user_id";
    return requete;
}
