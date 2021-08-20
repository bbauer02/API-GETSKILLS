const sequelize = require("../../db/sequelize");
const {QueryTypes} = require("sequelize");
const TVA = 20.00;

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
    const sessions = await Requete(REQ_SESSION(sessionId), 'session');
    const users = await Requete(REQ_USERS(sessionId, userId), 'users');
    const exams = await Requete(REQ_EXAMS(sessionId), 'exams');
    const examsInfos = await Requete(REQ_EXAMS_INFOS(sessionId), 'exams infos');
    const factures = await Requete(REQ_FACTURE(sessionId), 'factures');
    const facturesInfo = await Requete(REQ_FACTURE_INFOS(sessionId), 'factures infos');

    // console.log('institut->', instituts);
    // console.log('session->', sessions);
    // console.log('users->', users);
    console.log('exams->', exams);
    // console.log('exams infos ->', examsInfos);
    // console.log('factures->', factures);
    // console.log('factures info->', facturesInfo);

    let datasForPdf = [];

    users.forEach((user) => {
        const examens = exams.filter((exam) => exam.USER_ID === user.USER_ID);
        const myFactures = factures.filter((fact) => fact.USER_ID === user.USER_ID);
        const factInfos = facturesInfo.filter((fact) => fact.USER_ID === user.USER_ID);
        const examenInfos = examsInfos.filter((exam) => exam.USER_ID === user.USER_ID);

        let data = Object.assign(sessions[0], instituts[0], user, factInfos[0], {ARTICLES: myFactures}, examenInfos[0]);
        let oExams = {};

        let nbExams = 0;
        examens.forEach((exam, index) => {
            oExams[`EXAM_${++index}`] = exam.EXAM;
            nbExams += 1;
        })

        data = Object.assign(data, oExams, {NB_EXAMS: nbExams});

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
 * @param userId
 * @returns {string}
 * @constructor
 */
const REQ_USERS = (sessionId, userId) => {
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
    requete += "IFNULL(DATEDIFF(sessionUsers.inscription, '1899-12-30'), '-') as USER_DATE_INSCR, ";
    requete += "IFNULL(sessionUsers.numInscrAnt, '-') as USER_NUM_INSCR, "
    requete += "DATEDIFF(users.birthday, '1899-12-30') as USER_BIRTHDAY, ";
    requete += "countries.label as USER_COUNTRY ";
    requete += "from users ";

    requete += "join sessionUsers on sessionUsers.user_id = users.user_id ";
    requete += "join sessions on sessions.session_id = sessionUsers.session_id ";
    requete += "join countries on countries.country_id = users.country_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    if (userId) requete += "AND users.user_id = " + userId + " ";
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
    requete += "GROUP BY users.user_id, session_user_option.isCandidate, session_user_option.DateTime, session_user_option.addressExam "
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
    requete += "exams.label as DESIGNATION, ";
    requete += "1 as QUANTITY, ";
    requete += "IFNULL(session_user_option.user_price, 0) as PU, ";
    requete += "IFNULL(1 * session_user_option.user_price, 0) as HT, ";
    requete += "20 as TVA, ";
    requete += "IFNULL(((1 * session_user_option.user_price) * (1+(20/100))),0) as TTC "
    requete += "from session_user_option ";
    requete += "JOIN sessionUsers ON sessionUsers.sessionUser_id = sessionUsers.sessionUser_id ";
    requete += "JOIN exams ON session_user_option.exam_id = exams.exam_id ";
    requete += "JOIN tests ON exams.test_id = tests.test_id ";
    requete += "JOIN sessions ON sessions.test_id = tests.test_id ";
    requete += "where sessions.session_id = " + sessionId + " ";
    requete += "order by user_id";
    return requete
}

const REQ_FACTURE_INFOS = (sessionId) => {
    let requete = "SELECT ";
    requete += "sessionUsers.user_id as USER_ID, ";
    requete += "COUNT(exams.label) as NB_LIGNE, ";
    requete += "SUM(((1 * session_user_option.user_price))) as TOTAL_HT, ";
    requete += "SUM(((1 * session_user_option.user_price) * (1+(" + TVA + "/100)))) as TOTAL_TTC ";
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

module.exports = {Requete, ConstructDatasForPDf}

