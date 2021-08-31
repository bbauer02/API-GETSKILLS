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
const civilityList =
    {
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

    // retours chariots
    const RC = "\n";
    const RC2 = "\n\n";

    // datas
    let oFactures = {
        DESCRIPTIONS: '',
        QUANTITES: '',
        ARTICLES_PU: '',
        ARTICLES_HT: '',
        ARTICLES_TVA: '',
        ARTICLES_TTC: '',
        TOTAL_TTC: 0,
        TOTAL_HT: 0,
        TOTAL_TVA: 0
    };
    let oInfoFactures = {
        TEST: '',
        LEVEL: '',
        LIST_TVA: '',
        LIST_HT: '',
        LIST_TTC: ''
    };

    oInfoFactures.TEST = factures[0].TEST;
    oInfoFactures.LEVEL = factures[0].LEVEL;

    const listTva = factures.reduce((prev, curr) => {
        if (!prev.includes(curr.TVA)) {
            prev.push(curr.TVA);
        }
        return prev;
    }, []);

    oInfoFactures.LIST_TVA = listTva.reduce((prev, curr) => prev + curr.toFixed(2) + "\n", '');

    listTva.forEach((tva) => {
        oInfoFactures.LIST_HT += factures
            .filter((fact) => fact.TVA === tva)
            .reduce((prev, curr) => prev + ((curr.PU * curr.QUANTITY) / (1 + (tva / 100))), 0)
            .toFixed(2);

        oInfoFactures.LIST_TTC += factures
            .filter((fact) => fact.TVA === tva)
            .reduce((prev, curr) => prev + (curr.PU * curr.QUANTITY), 0)
            .toFixed(2);
    })

    factures.forEach((line, index) => {
        let carriage = RC;
        if (line.DESCRIPTION.length > 40 && line.DESCRIPTION.length <= 80) {
            carriage = RC2;
        }
        if (line.DESCRIPTION.length > 80) {
            oFactures.DESCRIPTIONS += line.DESCRIPTION.substr(0, 80) + '...' + RC;
        } else {
            oFactures.DESCRIPTIONS += line.DESCRIPTION + RC;
        }
        oFactures.QUANTITES += line.QUANTITY + carriage;
        oFactures.ARTICLES_PU += ((line.PU) / (1 + (line.TVA / 100))).toFixed(2) + carriage;
        oFactures.ARTICLES_TTC += (line.QUANTITY * line.PU).toFixed(2) + carriage;
        oFactures.ARTICLES_TVA += line.TVA.toFixed(2) + carriage;
        oFactures.ARTICLES_HT += ((line.QUANTITY * line.PU) / (1 + (line.TVA / 100))).toFixed(2) + carriage;
        oFactures.TOTAL_HT += (line.QUANTITY * line.PU) / (1 + (line.TVA / 100));
        oFactures.TOTAL_TVA += (line.QUANTITY * line.PU) * (1 - 1 / (1 + (line.TVA / 100)));
        oFactures.TOTAL_TTC += line.QUANTITY * line.PU;
    })

    return [Object.assign(instituts[0], oFactures, oInfoFactures )];

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

        // retours chariots
        const RC = "\n";
        const RC2 = "\n\n";

        // construction de l'utilisateur
        user.PAIEMENT_INSCRIPTION = paymentList[user.PAIEMENT_INSCRIPTION].label;
        user.USER_GENDER = civilityList[user.USER_GENDER].label;


        let oExams = {};
        let oFactures = {
            DESCRIPTIONS: '',
            QUANTITES: '',
            ARTICLES_PU: '',
            ARTICLES_HT: '',
            ARTICLES_TVA: '',
            ARTICLES_TTC: '',
            TOTAL_TTC: 0,
            TOTAL_HT: 0,
            TOTAL_TVA: 0
        };
        let oInfoFactures = {
            LIST_TVA: '',
            LIST_HT: '',
            LIST_TTC: ''
        };

        let nbExams = 0;
        examens.forEach((exam, index) => {
            oExams[`EXAM_${++index}`] = exam.EXAM;
            nbExams += 1;
        })

        const listTva = factures.reduce((prev, curr) => {
            if (!prev.includes(curr.TVA)) {
                prev.push(curr.TVA);
            }
            return prev;
        }, []);

        oInfoFactures.LIST_TVA = listTva.reduce((prev, curr) => prev + curr.toFixed(2) + "\n", '');

        listTva.forEach((tva) => {
            oInfoFactures.LIST_HT += linesFactures
                .filter((fact) => fact.TVA === tva)
                .reduce((prev, curr) => prev + ((curr.PU * curr.QUANTITY) / (1 + (tva / 100))), 0)
                .toFixed(2);

            oInfoFactures.LIST_TTC += linesFactures
                .filter((fact) => fact.TVA === tva)
                .reduce((prev, curr) => prev + (curr.PU * curr.QUANTITY), 0)
                .toFixed(2);
        })

        linesFactures.forEach((line, index) => {
            let carriage = RC;
            if (line.DESCRIPTION.length > 40 && line.DESCRIPTION.length <= 80) {
                carriage = RC2;
            }
            if (line.DESCRIPTION.length > 80) {
                oFactures.DESCRIPTIONS += line.DESCRIPTION.substr(0, 80) + '...' + RC;
            } else {
                oFactures.DESCRIPTIONS += line.DESCRIPTION + RC;
            }
            oFactures.QUANTITES += line.QUANTITY + carriage;
            oFactures.ARTICLES_PU += ((line.PU) / (1 + (line.TVA / 100))).toFixed(2) + carriage;
            oFactures.ARTICLES_TTC += (line.QUANTITY * line.PU).toFixed(2) + carriage;
            oFactures.ARTICLES_TVA += line.TVA.toFixed(2) + carriage;
            oFactures.ARTICLES_HT += ((line.QUANTITY * line.PU) / (1 + (line.TVA / 100))).toFixed(2) + carriage;
            oFactures.TOTAL_HT += (line.QUANTITY * line.PU) / (1 + (line.TVA / 100));
            oFactures.TOTAL_TVA += (line.QUANTITY * line.PU) * (1 - 1 / (1 + (line.TVA / 100)));
            oFactures.TOTAL_TTC += line.QUANTITY * line.PU;
        })


        // on regroupe toutes les données concernant un USER dans un objet DATA
        data = Object.assign(sessions[0], instituts[0], user, examenInfos[0], oExams, {NB_EXAMS: nbExams}, oFactures, oInfoFactures);

        // on l'ajoute dans un tableau
        datasForPdf = [...datasForPdf, {...data}];
    })

    // console.log(datasForPdf);
    return datasForPdf;
}

/**
 * obtenir un institut avec son id
 * @param institutId
 * @param alias
 * @returns {string}
 * @constructor
 */
const REQ_INSTITUT = async (institutId, alias) => {

    try {
        const institut = await models['Institut'].findOne({
            where: {institut_id: institutId},
            attributes: alias,
        })

        if(!institut) {
            throw new Error('no institut found')
        }

        if(institut.SCHOOL_ADDRESS2 && institut.SCHOOL_ADDRESS2 !== '') {
            institut.SCHOOL_ADRESS_FULL = institut.SCHOOL_ADDRESS1 + "\n" + institut.SCHOOL_ADDRESS2;
            institut.SCHOOL_ADRESS_FULL_INLINE = institut.SCHOOL_ADDRESS1 + " - " + institut.SCHOOL_ADDRESS2;
        } else {
            institut.SCHOOL_ADRESS_FULL = institut.SCHOOL_ADDRESS1;
            institut.SCHOOL_ADRESS_FULL_INLINE = institut.SCHOOL_ADDRESS1;
        }

        return institut

    } catch (e) {
        console.log(e.message);
    }
}

const ALIAS = {
    INSTITUT: [
        ['label', 'SCHOOL_NAME'],
        ['adress1', 'SCHOOL_ADDRESS1'],
        ['adress2', 'SCHOOL_ADDRESS2'],
        ['zipcode', 'SCHOOL_ZIPCODE'],
        ['city', 'SCHOOL_CITY'],
        ['phone', 'SCHOOL_PHONE'],
        ['email', 'SCHOOL_EMAIL'],
    ],
    INSTITUT_PIED: [
        ['label', 'SCHOOL_NAME_PIED'],
        ['adress1', 'SCHOOL_ADDRESS1_PIED'],
        ['adress2', 'SCHOOL_ADDRESS2_PIED'],
        ['zipcode', 'SCHOOL_ZIPCODE_PIED'],
        ['city', 'SCHOOL_CITY_PIED'],
        ['phone', 'SCHOOL_PHONE_PIED'],
        ['email', 'SCHOOL_EMAIL_PIED'],
    ]
}

/**
 * obtenir une session par son id
 * @param sessionId
 * @returns {string}
 * @constructor
 */
const REQ_SESSION = async (sessionId) => {

    const session = await models['Session'].findOne({
        where: {session_id: sessionId},

    })


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
    requete += "users.user_id        as USER_ID, "
    requete += "exams.label                 as DESCRIPTION, ";
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
    requete += "JOIN levels                 ON levels.level_id = exams.level_id ";
    requete += "WHERE sessions.session_id = " + sessionId + " ";
    requete += "AND Institut_has_prices.institut_id = " + institutId + " ";
    requete += "AND session_user_option.isCandidate = true ";
    if(userId) requete += requete += "AND users.user_id = " + userId + " ";
    requete += "GROUP BY exams.label, Institut_has_prices.tva, session_user_option.user_price, Institut_has_prices.price, sessionUsers.user_id, users.user_id "
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
    requete += "JOIN levels                 ON levels.level_id = exams.level_id ";
    requete += "WHERE sessions.session_id = " + sessionId + " ";
    requete += "AND Institut_has_prices.institut_id = " + institutId + " ";
    requete += "AND session_user_option.isCandidate = true ";
    requete += "GROUP BY exams.label, Institut_has_prices.tva, session_user_option.user_price, Institut_has_prices.price,tests.label,levels.label "
    return requete
}


module.exports = {
    Requete,
    ConstructDatasForPDf,
    ConstructDatasForInvoiceInPDF,
    REQ_INSTITUT,
    REQ_EXAMS,
    REQ_FACTURE_STUDENT,
    REQ_SESSION,
    REQ_USERS,
    REQ_EXAMS_INFOS,
    REQ_FACTURE,
}

