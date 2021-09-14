const { Op } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
const { createRepository, destroyTemporaryFolders } = require("../../services/manageFileSystem");
const { reponseHTTPWithCsv } = require("../../services/manageCSV");
const fs = require('fs');
const path = require("path");

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/exports',
        isAuthenticated, isAuthorized, async (req, res) => {

            async function getAllItemCsvByTest() {
                try {
                    const templateCsvFound = await models['csvItem'].findOne({
                        where: {
                            test_id: req.body.idTest
                        }
                    });
                    
                    if (templateCsvFound === null) {
                        return res.status(500).json({ message: "No template for this test" })
                    }

                    return JSON.parse(JSON.stringify(templateCsvFound));

                } catch (error) {

                    const message = `An error has occured getting all the item csv with test_id ${req.body.test_id}`;
                    return res.status(500).json({ message, data: error.message })
                }
            }

            async function getAllInformations() {
                try {

                    const parameters = {};
                    parameters.where = {
                        sessionUser_id: {
                            [Op.in]: req.body.sessionUserIds
                        }
                    };

                    parameters.include = [{
                        model: models['User'],
                        attributes: {
                            exclude: [
                                'password'
                            ]
                        },
                        include: [{
                            model: models['Country'],
                            as: 'country',
                            attributes: ["label"]
                        },
                        {
                            model: models['Country'],
                            as: 'nationality',
                            attributes: [["countryNationality", 'label']]
                        },
                        {
                            model: models['Language'],
                            as: 'firstlanguage',
                            attributes: ['name']
                        }]
                    },
                    {
                        model: models['Session'],
                        include: [{
                            model: models['sessionHasExam'],
                            include: [{
                                model: models['Exam']
                            }]
                        }]
                    },
                    {
                        model: models['sessionUserOption']
                    },
                    {
                        model: models['sessionExamHasExaminator'],
                        include: [{
                            model: models['empowermentTests'],
                            include: [{
                                model: models['User'],
                                attributes: {
                                    exclude: [
                                        'password'
                                    ]
                                },
                            }]
                        }]
                    }];

                    // parameters.raw = true;
                    // parameters.nest = true;

                    const allInformations = await models['sessionUser'].findAll(parameters);

                    return JSON.parse(JSON.stringify(allInformations));

                } catch (error) {

                    const message = `An error has occured finding all the informations`;
                    return res.status(500).json({ message, data: error.message })
                }
            }


            async function generateFile(templateCsvFound, allInformations) {
                try {

                    let csv = "";
                    const csvItems = templateCsvFound.field.split(";");
                    const arrayOfFields = templateCsvFound.label.split(";").map((item) => (
                        `${item}`
                    ));
                    
                    csv = arrayOfFields.join(";");
                    csv += "\n";

                    // Utiliser pour créer l'autre csv si inLine === true
                    let copyCsv = csv;

                    // TODO METTRE À JOUR LES CHAMPS DANS LE SWITCH CASE CI DESSOUS
                    // TODO METTRE AUSSI À JOUR LES CHAMPS EN FRONT DANS src\redux\slices\templateCsv.js

                    allInformations.forEach((allInformation) => {

                        // On créer un tableau pour chaque ligne, qu'on explosera avec des ";" + un "\n" à la fin
                        const row = [];

                        csvItems.forEach((item) => {
                            switch (item) {

                                // USER
                                case "User_firstname":
                                    row.push(allInformation.User.firstname);
                                    break;

                                case "User_lastname":
                                    row.push(allInformation.User.lastname);
                                    break;

                                case "User_email":
                                    row.push(allInformation.User.email);
                                    break;

                                case "User_phone":
                                    row.push(allInformation.User.phone);
                                    break;

                                case "User_civility":
                                    row.push(allInformation.User.civility);
                                    break;

                                case "User_gender":
                                    row.push(allInformation.User.gender);
                                    break;

                                case "User_adress1":
                                    row.push(allInformation.User.adress1);
                                    break;

                                case "User_adress2":
                                    row.push(allInformation.User.adress2);
                                    break;

                                case "User_zipcode":
                                    row.push(allInformation.User.zipcode);
                                    break;

                                case "User_city":
                                    row.push(allInformation.User.city);
                                    break;

                                case "User_birthday":
                                    row.push(allInformation.User.birthday);
                                    break;

                                case "User_nationality":
                                    row.push(allInformation.User.nationality.label);
                                    break;

                                case "User_country":
                                    row.push(allInformation.User.country.label);
                                    break;

                                case "User_firstlanguage":
                                    row.push(allInformation.User.firstlanguage.name);
                                    break;

                                // SESSIONUSER
                                case "sessionUser_paymentMode":
                                    row.push(allInformation.paymentMode);
                                    break;

                                case "sessionUser_numInscrAnt":
                                    row.push(allInformation.numInscrAnt);
                                    break;

                                case "sessionUser_inscription":
                                    row.push(allInformation.inscription);
                                    break;

                                case "sessionUser_hasPaid":
                                    row.push(allInformation.hasPaid);
                                    break;

                                case "sessionUser_informations":
                                    row.push(allInformation.informations);
                                    break;

                                // SESSIONHASEXAM
                                case "sessionHasExam_adressExam":
                                    const allAdress = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam) => {
                                        allAdress.push(sessionHasExam.adressExam);
                                    })
                                    row.push(allAdress.join(";"));
                                    break;

                                case "sessionHasExam_room":
                                    const allRoom = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam) => {
                                        allRoom.push(sessionHasExam.room);
                                    })
                                    row.push(allRoom.join(";"));
                                    break;

                                case "sessionHasExam_DateTime":
                                    const allDateTime = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam) => {
                                        allDateTime.push(sessionHasExam.DateTime);
                                    })
                                    row.push(allDateTime.join(";"));
                                    break;


                                // EXAMS
                                case "Exam_label":
                                    const allExamLabel = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam) => {
                                        allExamLabel.push(sessionHasExam.Exam.label);
                                    })
                                    row.push(allExamLabel.join(";"));
                                    break;

                                // SESSIONUSEROPTION
                                case "sessionUserOption_userPrice":
                                    const allUserPrice = [];
                                    allInformation.sessionUserOptions.forEach((sessionUserOption) => {
                                        allUserPrice.push(sessionUserOption.userPrice);
                                    });
                                    row.push(allUserPrice.join(";"));
                                    break;

                                case "sessionUserOption_isCandidate":
                                    const allIsCandidate = [];
                                    allInformation.sessionUserOptions.forEach((sessionUserOption) => {
                                        allIsCandidate.push(sessionUserOption.isCandidate);
                                    });
                                    row.push(allIsCandidate.join(";"));
                                    break;

                                // EXAMINATOR
                                case "Examinator_firstname":
                                    const allFirstname = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam, index) => {
                                        // si le cnadidat ne participe pas à une session, il ne peut
                                        // pas avoir d'examinateur attribuer (sessionExamHasExaminator inéxistant)
                                        allInformation.sessionUserOptions.forEach((sessionUserOption) => {

                                            if (sessionUserOption.exam_id === sessionHasExam.exam_id) {
                                                if (sessionUserOption.isCandidate === true) {
                                                    allFirstname.push(
                                                        allInformation.sessionExamHasExaminators[index].empowermentTest?.User.firstname || ""
                                                    );
                                                } else {
                                                    allFirstname.push("");
                                                }
                                            }
                                        })
                                    });
                                    row.push(allFirstname.join(";"));
                                    break;

                                case "Examinator_lastname":
                                    const allLastname = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam, index) => {
                                        // si le cnadidat ne participe pas à une session, il ne peut
                                        // pas avoir d'examinateur attribué (sessionExamHasExaminator inéxistant)
                                        allInformation.sessionUserOptions.forEach((sessionUserOption) => {

                                            if (sessionUserOption.exam_id === sessionHasExam.exam_id) {
                                                if (sessionUserOption.isCandidate === true) {
                                                    allLastname.push(
                                                        allInformation.sessionExamHasExaminators[index].empowermentTest?.User.lastname || ""
                                                    );
                                                } else {
                                                    allLastname.push("");
                                                }
                                            }
                                        })
                                    });
                                    row.push(allLastname.join(";"));
                                    break;

                                case "Examinator_code":
                                    const allcode = [];
                                    allInformation.Session.sessionHasExams.forEach((sessionHasExam, index) => {
                                        // si le cnadidat ne participe pas à une session, il ne peut
                                        // pas avoir d'examinateur attribuer (sessionExamHasExaminator inéxistant)
                                        allInformation.sessionUserOptions.forEach((sessionUserOption) => {

                                            if (sessionUserOption.exam_id === sessionHasExam.exam_id) {
                                                if (sessionUserOption.isCandidate === true) {
                                                    allcode.push(
                                                        allInformation.sessionExamHasExaminators[index].empowermentTest?.User.code || ""
                                                    );
                                                } else {
                                                    allcode.push("");
                                                }
                                            }
                                        })
                                    });
                                    row.push(allcode.join(";"));
                                    break;

                                default:
                                    row.push("undefined")
                                    break;
                            }
                        })
                        const rowData = row.map((content) => (
                            `${content}`
                        )).join(",");

                        csv = csv + rowData + "\n";
                    })

                    const splited = csv.split("\n");
                    const csvArray = [];

                    // On remet tout sous forme de tableau
                    splited.forEach((row, index) => {
                        if (index !== 0) {
                            csvArray.push(row.split(','))
                        }
                    });
                    csvArray.pop();


                    // On refactore le tableau pour les cases à plusieurs valeurs
                    const arrayRefactor = [];
                    csvArray.forEach((user) => {
                        const arrayRow = [];
                        user.forEach((row) => {
                            // Si champ multiple
                            arrayRow.push(row.split(";"));
                        });
                        arrayRefactor.push(arrayRow);
                    });


                    // On créer le dernier tableau content toutes les lignes
                    const finalArray = [];
                    arrayRefactor.forEach((user) => {
                        const allRows = [];
                        const allField = []
                        user.forEach((fields, y) => {
                            allField.push(fields[0]);

                            if (fields.length > 1) {
                                fields.forEach((field, z) => {
                                    if (z > 0) {
                                        let allSubFields = [];
                                        if (allRows[z] !== undefined) {
                                            allSubFields = [...allRows[z]];
                                        }
                                        allSubFields[y] = field;
                                        allRows[z] = allSubFields;
                                    }
                                })
                            }
                        })
                        allRows[0] = allField;
                        finalArray.push(allRows);
                    })


                    // On reécrit le csv
                    finalArray.forEach((user) => {
                        user.forEach((row) => {
                            copyCsv += row.join(";");
                            copyCsv += "\n";
                        })
                    });


                    // Depend de inLine
                    return templateCsvFound.inLine === true ? csv : copyCsv;

                } catch (error) {

                    const message = `An error has occured building the csv file`;
                    return res.status(500).json({ message, data: error.message })
                }
            }


            try {
                // Charge le template
                const templateCsvFound = await getAllItemCsvByTest();

                // On prend toutes les informations nécéssaire pour le csv
                const allInformations = await getAllInformations();

                // On génére le fichier csv
                const csvGenerated = await generateFile(templateCsvFound, allInformations);

                // destruction du dossier temporaire si existant
                await destroyTemporaryFolders();

                // création du dossier temporaire dans lequel on met les PDF générés
                const folder = createRepository();

                // Nom du fichier à créer
                const fileName = `Session_${new Date(allInformations[0]?.Session.start).toISOString().slice(0, 10).replace(/-/g, "")}.csv`;

                // création du fichier csv dans le dossier temporaire
                try {
                    fs.writeFileSync(`${path.join(folder, fileName)}`, csvGenerated)
                    console.log("File written successfully")
                } catch (error) {
                    console.log(error)
                }

                reponseHTTPWithCsv(fileName, res);

            } catch (error) {
                const message = `An error has occured.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
    );
}
