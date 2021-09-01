const sequelize = require("../db/sequelize");
const {QueryTypes} = require("sequelize");
const paymentList = {
    1: {
        payment_id: 1,
        label: 'Carte Bancaire'
    },
    2: {
        payment_id: 2,
        label: 'PayPal'
    },
    3: {
        payment_id: 3,
        label: 'Virement bancaire'
    },
    4: {
        payment_id: 4,
        label: 'Chèque'
    }
};
const civilityList = {
    1: {
        civility_id: 1,
        label: 'Mr.'
    },
    2: {
        civility_id: 2,
        label: 'Mme.'
    }
};

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
        items = await sequelize.query(reqString, {nest: true, type: QueryTypes.SELECT});
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
 * Construction des données pour les factures du CIFLE vers les écoles
 * @param institutId
 * @param sessionId
 * @returns {Promise<{oInfoFactures: {LIST_TVA: string, LIST_HT: string, LIST_TTC: string}, oFactures: {QUANTITES: string, ARTICLES_PU: string, ARTICLES_TVA: string, TOTAL_TVA: number, ARTICLES_HT: string, TOTAL_HT: number, TOTAL_TTC: number, ARTICLES_TTC: string, DESCRIPTIONS: string}, instituts: void}>}
 * @constructor
 */
async function ConstructDatasForInvoiceInPDF (institutId, sessionId) {

    // requetes
    const instituts = await Requete(REQ_INSTITUT(institutId), 'institut');
    const factures = await Requete(REQ_FACTURE(sessionId, institutId), 'facture');

    let oFacture = formaterLaFacture(factures);
    oFacture = {
        ...oFacture, TEST: oFacture[0].TEST, LEVEL: oFacture[0].LEVEL, DATE_START: oFacture[0].DATE_START
    }

    return [Object.assign(instituts[0], oFacture)];

}

/**
 * Construction d'un répertoire de données à partir des requête
 * @param institutId
 * @param sessionId
 * @param userId
 * @returns {Promise<*[]>} renvoie un tableau de données triées par utilisateur
 * @constructor
 */
async function ConstructDatasForPDf (institutId, sessionId, userId) {

    // requetes
    const instituts = await Requete(REQ_INSTITUT(institutId), 'institut');
    // const sessions = await Requete(REQ_SESSION(sessionId), 'session');
    const users = await Requete(REQ_USERS(sessionId, userId), 'users');
    const exams = await Requete(REQ_EXAMS(sessionId), 'exams');
    const examsInfos = await Requete(REQ_EXAMS_INFOS(sessionId), 'exams infos');
    const factures = await Requete(REQ_FACTURE_STUDENT(sessionId, institutId, userId), 'factures');

    // console.log('institut->', instituts);
    // console.log('session->', sessions);
    // console.log('users->', users);
    // console.log('exams->', exams);
    // console.log('exams infos ->', examsInfos);
    // console.log('factures->', factures);
    // console.log('factures info->', facturesInfo);

    let datasForPdf = [];

    users.forEach((user) => {

        // on construit les données pour chaque utilisateur

        const examens = exams.filter((exam) => exam.USER_ID === user.USER_ID); // épreuves demandées par l'utilisateur
        const linesFactures = factures.filter((fact) => fact.USER_ID === user.USER_ID); // liste des articles de la facture
        const examenInfos = examsInfos.filter((exam) => exam.USER_ID === user.USER_ID); // informations sur les examens

        // construction de l'utilisateur
        user.PAIEMENT_INSCRIPTION = paymentList[user.PAIEMENT_INSCRIPTION].label;
        user.USER_GENDER = civilityList[user.USER_GENDER].label;

        let oExams = {};

        let nbExams = 0;
        examens.forEach((exam, index) => {
            oExams[`EXAM_${++index}`] = exam.EXAM;
            nbExams += 1;
        })

        let oFacture = formaterLaFacture(linesFactures);
        oFacture = {
            ...oFacture, TEST: factures[0].TEST, LEVEL: factures[0].LEVEL, DATE_START: factures[0].DATE_START
        }

        // on regroupe toutes les données concernant un USER dans un objet DATA
        data = Object.assign(instituts[0], user, examenInfos[0], oExams, {NB_EXAMS: nbExams}, oFacture);

        // on l'ajoute dans un tableau
        datasForPdf = [...datasForPdf, {...data}];
    })

    // console.log(datasForPdf);
    return datasForPdf;
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
    requete += "IF(ISNULL(instituts.adress2) OR instituts.adress2 = '', instituts.adress1, CONCAT(instituts.adress1,'\r\n',instituts.adress2)) as SCHOOL_ADDRESS1, IF(ISNULL(instituts.adress2) OR instituts.adress2 = '', instituts.adress1, CONCAT(instituts.adress1,' - ',instituts.adress2)) as SCHOOL_ADDRESS1_PIED, ";
    requete += "instituts.adress1 as SCHOOL_ADDRESS2, instituts.adress1 as SCHOOL_ADDRESS2_PIED, ";
    requete += "instituts.zipcode as SCHOOL_ZIPCODE, instituts.zipcode as SCHOOL_ZIPCODE_PIED, ";
    requete += "instituts.city as SCHOOL_CITY, instituts.city as SCHOOL_CITY_PIED, ";
    requete += "instituts.phone as SCHOOL_PHONE, instituts.phone as SCHOOL_PHONE_PIED, ";
    requete += "instituts.email as SCHOOL_EMAIL, instituts.email as SCHOOL_EMAIL_PIED ";
    requete += "FROM instituts ";
    requete += "WHERE instituts.institut_id = " + institutId;
    return requete;
}



/**
 * Obtenir la liste des candidats pour la session
 * @param sessionId
 * @param userId
 * @returns {string}
 * @constructor
 */
const REQ_USERS = (sessionId, userId) => {
    let requete = "SELECT DISTINCT ";
    requete += "users.civility as USER_GENDER, ";
    requete += "users.user_id as USER_ID, ";
    requete += "users.lastname as USER_LASTNAME, ";
    requete += "users.firstname as USER_FIRSTNAME, ";
    requete += "IF(ISNULL(users.adress2) OR users.adress2 = '', users.adress1, CONCAT(users.adress1,'\r\n',users.adress2)) as USER_ADRESS1, ";
    requete += "users.adress2 as USER_ADRESS2, ";
    requete += "users.zipcode as USER_ZIPCODE, ";
    requete += "users.city as USER_CITY, ";
    requete += "users.phone as USER_PHONE, ";
    requete += "users.email as USER_MAIL, ";
    requete += "DATEDIFF(sessions.start, '1899-12-30') as SESSION_START_DATE, ";
    requete += "(HOUR(sessions.start) * 60 + MINUTE(sessions.start))/1440 as SESSION_START_HOUR, ";
    requete += "IFNULL(levels.label, '') as LEVEL, ";
    requete += "tests.label as TEST, ";
    requete += "sessionUsers.paymentMode as PAIEMENT_INSCRIPTION, "
    requete += "DATEDIFF(IFNULL(sessionUsers.inscription, '1899-12-30'), '1899-12-30') as USER_DATE_INSCR, ";
    requete += "IFNULL(sessionUsers.numInscrAnt, '-') as USER_NUM_INSCR, "
    requete += "DATEDIFF(users.birthday, '1899-12-30') as USER_BIRTHDAY, ";
    requete += "countries.label as USER_COUNTRY, ";
    requete += "countries.countryNationality as USER_NATIONALITY, ";
    requete += "countries.countryLanguage as USER_LANGUAGE, ";
    requete += "CONCAT(DATE_FORMAT(sessionUsers.inscription, '%Y'), DATE_FORMAT(sessionUsers.inscription, '%m'), sessionUsers.sessionUser_id) as USER_NUM_INSCR "
    requete += "from users ";
    requete += "join sessionUsers on sessionUsers.user_id = users.user_id ";
    requete += "join sessions on sessions.session_id = sessionUsers.session_id ";
    requete += "join countries on countries.country_id = users.country_id ";
    requete += "join session_user_option on sessionUsers.sessionUser_id = session_user_option.sessionUser_id ";
    requete += "join exams on session_user_option.exam_id = exams.exam_id ";
    requete += "join tests on tests.test_id = exams.test_id ";
    requete += "left join levels on exams.level_id = levels.level_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    if (userId) requete += "AND users.user_id = " + userId + " ";
    requete += "AND session_user_option.isCandidate = true "
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
    requete += "exams.label as EXAM ";
    requete += "from sessions ";
    requete += "join tests on tests.test_id = sessions.test_id ";
    requete += "left join exams on tests.test_id = exams.test_id ";
    requete += "left join levels on exams.level_id = levels.level_id ";
    requete += "join sessionUsers on sessionUsers.session_id = sessions.session_id ";
    requete += "join session_user_option on session_user_option.exam_id = exams.exam_id ";
    requete += "join users on sessionUsers.user_id = users.user_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "AND session_user_option.isCandidate = true "
    requete += "GROUP BY users.user_id, exams.label, session_user_option.isCandidate, session_user_option.DateTime, session_user_option.addressExam "
    requete += "order by user_id";
    return requete
}

const REQ_EXAMS_INFOS = (sessionId) => {
    let requete = "SELECT ";
    requete += "users.user_id as USER_ID, ";
    requete += "session_user_option.isCandidate as EXAM_IS_CANDIDATE, ";
    requete += "session_user_option.DateTime as USER_DATE_INSCRIPTION, ";
    requete += "session_user_option.addressExam as EXAM_ADDRESS ";
    requete += "from sessions ";
    requete += "join tests on tests.test_id = sessions.test_id ";
    requete += "left join exams on tests.test_id = exams.test_id ";
    requete += "left join levels on exams.level_id = levels.level_id ";
    requete += "join sessionUsers on sessionUsers.session_id = sessions.session_id ";
    requete += "join session_user_option on session_user_option.exam_id = exams.exam_id ";
    requete += "join users on sessionUsers.user_id = users.user_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "AND session_user_option.isCandidate = true ";
    requete += "GROUP BY users.user_id, session_user_option.isCandidate, session_user_option.DateTime, session_user_option.addressExam "
    requete += "order by user_id";
    return requete
}


/**
 * Récupérer les prix des examens par utilisateur.
 * Générer une facture du CIFLE vers une école.
 * @param sessionId
 * @param institutId
 * @param userId
 * @returns {string}
 * @constructor
 */
const REQ_FACTURE_STUDENT = (sessionId, institutId, userId) => {
    let requete = "SELECT ";
    requete += "users.user_id as USER_ID, "
    requete += "exams.label as label, ";
    requete += "tests.label as TEST, "
    requete += "levels.label as LEVEL, ";
    requete += "sessions.start as DATE_START, ";
    requete += "Institut_has_prices.tva as tva, ";
    requete += "IF(ISNULL(session_user_option.user_price), Institut_has_prices.price, session_user_option.user_price) as price_pu_ttc, ";
    requete += "SUM(IF(ISNULL(session_user_option.user_price), Institut_has_prices.price, session_user_option.user_price)) as TOTAL_TTC, ";
    requete += "COUNT(sessionUsers.user_id) as quantity "
    requete += "from exams ";
    requete += "JOIN session_user_option ON session_user_option.exam_id = exams.exam_id ";
    requete += "JOIN sessionUsers ON sessionUsers.sessionUser_id = session_user_option.sessionUser_id ";
    requete += "JOIN sessions ON sessions.session_id = sessionUsers.session_id ";
    requete += "JOIN Institut_has_prices ON Institut_has_prices.exam_id = exams.exam_id "
    requete += "JOIN users ON users.user_id = sessionUsers.user_id ";
    requete += "JOIN tests ON exams.test_id = tests.test_id  ";
    requete += "right JOIN levels ON levels.level_id = exams.level_id ";
    requete += "WHERE sessions.session_id = " + sessionId + " ";
    requete += "AND Institut_has_prices.institut_id = " + institutId + " ";
    requete += "AND session_user_option.isCandidate = true ";
    if (userId) requete += "AND users.user_id = " + userId + " ";
    requete += "GROUP BY exams.label, Institut_has_prices.tva, session_user_option.user_price, Institut_has_prices.price, sessionUsers.user_id, users.user_id, tests.label, levels.label, sessions.start "
    requete += "ORDER BY user_id";
    return requete
}

const REQ_FACTURE = (sessionId, institutId) => {
    let requete = "SELECT ";
    requete += "exams.label                 as DESCRIPTION, ";
    requete += "tests.label                 as TEST, ";
    requete += "levels.label                as LEVEL, ";
    requete += "sessions.start              as DATE_START, ";
    requete += "Institut_has_prices.tva     as TVA, ";
    requete += "IF(ISNULL(session_user_option.user_price), Institut_has_prices.price, session_user_option.user_price)       as PU, ";
    requete += "SUM(IF(ISNULL(session_user_option.user_price), Institut_has_prices.price, session_user_option.user_price))  as TOTAL_TTC, ";
    requete += "COUNT(sessionUsers.user_id) as QUANTITY "
    requete += "from exams ";
    requete += "JOIN session_user_option    ON session_user_option.exam_id = exams.exam_id ";
    requete += "JOIN sessionUsers           ON sessionUsers.sessionUser_id = session_user_option.sessionUser_id ";
    requete += "JOIN sessions               ON sessions.session_id = sessionUsers.session_id ";
    requete += "JOIN Institut_has_prices    ON Institut_has_prices.exam_id = exams.exam_id "
    requete += "JOIN users                  ON users.user_id = sessionUsers.user_id ";
    requete += "JOIN tests                  ON exams.test_id = tests.test_id  ";
    requete += "left JOIN levels                 ON levels.level_id = exams.level_id ";
    requete += "WHERE sessions.session_id = " + sessionId + " ";
    requete += "AND Institut_has_prices.institut_id = " + institutId + " ";
    requete += "AND session_user_option.isCandidate = true ";
    requete += "GROUP BY exams.label, Institut_has_prices.tva, session_user_option.user_price, Institut_has_prices.price,tests.label,levels.label "
    return requete
}

function formaterLaFacture (lines) {

    let articleLine = {
        DESCRIPTIONS: '',
        QUANTITES: '',
        ARTICLES_PU: '',
        ARTICLES_HT: '',
        ARTICLES_TVA: '',
        ARTICLES_TTC: '',
        TOTAL_HT: 0,
        TOTAL_TVA: 0,
        TOTAL_TTC: 0,
        LIST_TVA: ''
    }

    let datasForPdf = lines.reduce((prev, curr) => {
        // retours chariots
        const RC = "\n";
        const RC2 = "\n\n";
        let carriage = RC;

        if (curr.label.length < 40) {
            prev.DESCRIPTIONS += curr.label + RC;
        } else if (curr.label.length >= 40 && curr.label.length < 80) {
            carriage = RC2;
            prev.DESCRIPTIONS += curr.label.substr(0, 79) + RC;
        } else {
            carriage = RC2;
            prev.DESCRIPTIONS += curr.label.substr(0, 79) + '...' + RC;
        }

        prev.QUANTITES += curr.quantity + carriage;
        prev.ARTICLES_PU += curr.price_pu_ttc + carriage;
        prev.ARTICLES_TVA += curr.tva + carriage;
        prev.ARTICLES_HT += ((curr.quantity * curr.price_pu_ttc) / (1 + (curr.tva / 100))).toFixed(2) + carriage;
        prev.ARTICLES_TTC += (curr.price_pu_ttc * curr.quantity) + carriage;
        prev.TOTAL_HT += ((curr.quantity * curr.price_pu_ttc) / (1 + (curr.tva / 100)));
        prev.TOTAL_TVA += (curr.quantity * curr.price_pu_ttc) * (1 - (1 / (1 + (curr.tva / 100))));
        prev.TOTAL_TTC += curr.quantity * curr.price_pu_ttc;

        return prev;
    }, articleLine)

    const listTva = lines.reduce((prev, curr) => {
        if (!prev.includes(curr.tva)) {
            prev.push(curr.tva);
        }
        return prev;
    }, []);

    datasForPdf = {
        ...datasForPdf,
        LIST_TVA: listTva.reduce((prev, curr) => prev + curr.toFixed(2) + "\n", ''),
    }

    datasForPdf = {...datasForPdf, LIST_TTC: '', LIST_HT: ''};

    listTva.forEach((tva) => {
        datasForPdf.LIST_HT += lines
                .filter((line) => line.tva === tva)
                .reduce((prev, curr) => prev + ((curr.price_pu_ttc * curr.quantity) / (1 + (tva / 100))), 0)
                .toFixed(2)
            + "\n"

        datasForPdf.LIST_TTC += lines
                .filter((fact) => fact.tva === tva)
                .reduce((prev, curr) => prev + (curr.price_pu_ttc * curr.quantity), 0)
                .toFixed(2)
            + "\n"
    })

    return datasForPdf;

}


module.exports = {
    Requete,
    ConstructDatasForPDf,
    ConstructDatasForInvoiceInPDF,
    REQ_INSTITUT,
    REQ_EXAMS,
    REQ_FACTURE_STUDENT,
    REQ_USERS,
    REQ_EXAMS_INFOS,
    REQ_FACTURE,
    formaterLaFacture
}

