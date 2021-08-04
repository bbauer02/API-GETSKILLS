const fs = require("fs");
const {models} = require("../../models");
const unoconv = require('unoconv-promise');
const sequelize = require("../../db/sequelize");
const {QueryTypes} = require("sequelize");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const asyncLib = require('async');
const PDFMerger = require('pdf-merger-js');
const async = require("async");

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/documents/:doc/download/', async (req, res) => {

        const documentId = req.params.doc;
        const type = "application/pdf";
        const institutId = req.params.institut_id;
        const userId = req.query.user_id;
        const sessionId = req.query.session_id;
        const projectFolder = process.cwd();
        const tmpFolder = process.cwd() + '/tmp/';

        asyncLib.waterfall([
                function (done) {
                    sequelize.query(
                        INSTITUT(institutId), {type: QueryTypes.SELECT}
                    ).then(function (institutFound) {
                            if (!institutFound) {
                                return res.status(400).json({
                                    message: 'Institut does not exist. retry wit another institut ID',
                                    data: null
                                })
                            } else {
                                done(null, {
                                    SCHOOL_NAME: institutFound[0].label,
                                    SCHOOL_ADDRESS1: institutFound[0].adress1,
                                    SCHOOL_ADDRESS2: institutFound[0].adress2,
                                    SCHOOL_ZIPCODE: institutFound[0].zipcode,
                                    SCHOOL_CITY: institutFound[0].city,
                                    SCHOOL_PHONE: institutFound[0].phone,
                                    SCHOOL_EMAIL: institutFound[0].email,
                                    SCHOOL_NAME_PIED: institutFound[0].label,
                                    SCHOOL_ADDRESS1_PIED: institutFound[0].adress1,
                                    SCHOOL_ADDRESS2_PIED: institutFound[0].adress2,
                                    SCHOOL_ZIPCODE_PIED: institutFound[0].zipcode,
                                    SCHOOL_CITY_PIED: institutFound[0].city,
                                    SCHOOL_PHONE_PIED: institutFound[0].phone,
                                    SCHOOL_EMAIL_PIED: institutFound[0].email,
                                })
                            }
                        }
                    ).catch(function (error) {
                        return res.status(400).json({message: error.message, data: null})
                    })
                },

                function (institut, done) {
                    sequelize.query(
                        SESSION(sessionId), {type: QueryTypes.SELECT}
                    ).then(function (sessionFound) {
                        if (!sessionFound) {
                            return res.status(400).json({
                                message: 'session does not exist.',
                                data: null
                            })
                        } else {
                            done(null, institut, sessionFound[0])
                        }
                    })
                },

                function (institut, session, done) {
                    sequelize.query(
                        USERS(sessionId), {type: QueryTypes.SELECT}
                    ).then(function (usersFound) {
                        if (!usersFound) {
                            return res.status(400).json({
                                message: 'users does not exist.',
                                data: null
                            })
                        } else {
                            done(null, institut, session, usersFound)
                        }
                    })
                },

                function (institut, session, users, done) {
                    sequelize.query(
                        EXAMS(sessionId), {type: QueryTypes.SELECT}
                    ).then(function (examsFound) {
                        if (!examsFound) {
                            return res.status(400).json({
                                message: 'exams does not exist.',
                                data: null
                            })
                        } else {
                            done(null, institut, session, users, examsFound)
                        }
                    })
                },

                function (institut, session, users, exams, done) {
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
                        // console.log(datasForPdf);
                    })

                    done(null, datasForPdf);
                },

                function (datasForPdf, done) {
                    // console.log(datasForPdf);
                    models['Document'].findOne({
                        where: {document_id: documentId}
                    }).then(function (docFound) {
                        done(null, datasForPdf, docFound)

                    }).catch(function (error) {
                        const message = `Service not available. Please retry later.`;
                        return res.status(500).json({message, data: error.message})
                    });
                },

                function (datasForPdf, docFound, done) {
                    //console.log(datasForPdf);
                    if (docFound === null) {
                        const message = `document doesn't exist. Retry with an other document id.`;
                        return res.status(404).json({message});
                    } else {
                        done(null, datasForPdf, docFound)
                    }
                },

                function (datasForPdf, docFound, done) {
                    datasForPdf.forEach((data, index) => {
                        console.log("---------- DATA ---------\n", data);
                        createPdf(docFound, index, data)
                    })
                    done(null);
                },

                function (done) {
                    try {
                        const merger = new PDFMerger();
                        console.log('tmp', fs.readdirSync(tmpFolder).length);
                        if(fs.readdirSync(tmpFolder).length>1) {
                            fs.readdirSync(tmpFolder).forEach(fileName => {
                                merger.add(tmpFolder + '/' + fileName);
                            })
                            merger.save(projectFolder + '/merged.pdf');
                        } else {
                            fs.copyFileSync(tmpFolder + 'temp0.pdf', projectFolder + '/merged.pdf');
                        }

                        done(null);
                    } catch (e) {
                        console.log(e.message)
                    }
                }
            ],

            function () {
                const s = fs.createReadStream(projectFolder + '/merged.pdf');
                const myFilename = encodeURIComponent("myDocument.pdf");
                res.setHeader('Content-disposition', 'inline; filename="' + myFilename + '"');
                res.setHeader('Content-Type', type);
                s.pipe(res);
            }
        );

    });
}

function createPdf(docFound, index, data) {
    unoconv.run({
        file: docFound.filepath,
        fields: data,
        output: process.cwd() + '/tmp/' + "temp" + index + ".pdf"
    }).catch(function (error) {
        return console.log(error.message);
    })
}

/**
 * obtenir un institut avec son id
 * @param institutId
 * @returns {string}
 * @constructor
 */
const INSTITUT = (institutId) => {
    return "SELECT * FROM instituts WHERE instituts.institut_id = " + institutId
}

/**
 * obtenir une session par son id
 * @param sessionId
 * @returns {string}
 * @constructor
 */
const SESSION = (sessionId) => {
    let requete = "SELECT DATE_FORMAT(sessions.start, '%d %M %Y') as SESSION_START_DATE, DATE_FORMAT(sessions.start, '%Hh%i')as SESSION_START_HOUR, IFNULL(levels.label, '') as LEVEL, tests.label as TEST FROM sessions ";
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
const USERS = (sessionId) => {
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
const EXAMS = (sessionId) => {
    let requete = "SELECT users.user_id as USER_ID, exams.label as EXAM, session_user_option.isCandidate as EXAM_IS_CANDIDATE, session_user_option.DateTime as USER_DATE_INSCRIPTION from sessions ";
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