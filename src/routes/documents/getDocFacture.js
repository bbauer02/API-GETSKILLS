const fs = require("fs");
const {models} = require("../../models");
const unoconv = require('unoconv-promise');
const sequelize = require("../../db/sequelize");
const {QueryTypes} = require("sequelize");
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const asyncLib = require('async');
const PDFMerger = require('pdf-merger-js');

/**
 * Permet de lancer une requete
 * @param reqString
 * @param name
 * @returns {Promise<void>}
 * @constructor
 */
async function Requete(reqString, name) {
    sequelize.query(
        reqString, {type: QueryTypes.SELECT}
    ).then(function (itemsFound) {
        if (!itemsFound) {
            throw new Error(name + ": not found")
        } else {
            return itemsFound
        }
    }).catch(function(error) {
        throw new Error(error.message)
    })
}


module.exports = (app) => {
    app.get('/api/instituts/:institut_id/documents/:doc/download/', async (req, res) => {

        const documentId = req.params.doc;
        const type = "application/pdf";
        const institutId = req.params.institut_id;
        const userId = req.query.user_id;
        const sessionId = req.query.session_id;
        const projectFolder = process.cwd();
        const tmpFolder = process.cwd() + '/tmp/';


        try {
            const instituts = await Requete(REQ_INSTITUT(institutId), 'institut');
            const sessions = await Requete(REQ_SESSION(sessionId), 'session');
            const users = await Requete(REQ_USERS(sessionId), 'users');
            const exams = await Requete(REQ_EXAMS(sessionId), 'exams');

        } catch (e) {
            return res.status(400).json({message: e.message, data: null})
        }


        asyncLib.waterfall([

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

                async function (datasForPdf, docFound, done) {

                    fs.mkdirSync(tmpFolder, (err, folder) => {
                        if (err) {
                            console.log(err.message)
                        }
                    });

                    await createPdf(docFound, datasForPdf)

                    fs.readdir(tmpFolder, (err, files) => {
                        if (err) {
                            console.log(err.message)
                        } else {
                            console.log("\nCurrent directory filenames:");
                            files.forEach(file => {
                                console.log(file);
                            })
                        }
                    });

                    done(null);
                },

                function (done) {
                    try {
                        const merger = new PDFMerger();
                        const d = fs.readdirSync(tmpFolder, {withFileTypes: true});
                        console.log(d, tmpFolder);
                        if (d.length > 1) {
                            d.forEach(fileName => {
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

                // suppression des fichiers temporaires
                fs.unlinkSync(projectFolder + '/merged.pdf')
                fs.rmdirSync(tmpFolder)
            }
        );


        /*
         await createPdf({filepath: projectFolder + "/public/monFichier.odt"}, [{SCHOOL_NAME: "mon école"}])

         fs.readdir(tmpFolder, (err, files) => {
             if (err) {
                 console.log(err.message)
             } else {
                 console.log("\nCurrent directory filenames:");
                 files.forEach(file => {
                     console.log(file);
                 })
             }
         });

         */

    });
}

async function createPdf (docFound, datasForPdf) {

    let index = 0;
    for await (const data of datasForPdf) {
        unoconv.run({
            file: docFound.filepath,
            fields: data,
            output: process.cwd() + '/tmp/' + "temp" + index + ".pdf"
        }).catch(function (error) {
            return console.log(error.message);
        })
        index += 1;
    }

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