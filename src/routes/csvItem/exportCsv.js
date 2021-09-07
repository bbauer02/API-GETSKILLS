const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
const fs = require('fs');
const del = require("del");
const path = require("path");
const { Parser } = require('json2csv');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/exports',
        isAuthenticated, isAuthorized, async (req, res) => {

            async function getAllItemCsvByTest() {
                try {
                    const csvItemsFound = await models['csvItem'].findAll({
                        where: {
                            test_id: req.body.idTest
                        }
                    });

                    return JSON.parse(JSON.stringify(csvItemsFound));

                } catch (error) {

                    const message = `An error has occured getting all the item csv with test_id ${req.body.test_id}`;
                    return res.status(500).json({ message, data: error.message })
                }
            }

            async function getAllInformations() {
                try {

                    const parameters = {};
                    // TODO forEach req.body.sessionUserIds dans le try en passant en param l'id
                    parameters.where = {
                        sessionUser_id: 2
                    };

                    parameters.include = [{
                        model: models['User'],
                        attributes: {
                            exclude: [
                                'password',
                                'user_id',
                                'firstlanguage_id',
                                'systemRole_id',
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
                        attributes: {
                            exclude: [
                                'session_id',
                                'institut_id',
                                'test_id',
                                'level_id',
                            ]
                        },
                        include: [{
                            model: models['sessionHasExam'],
                            attributes: {
                                exclude: [
                                    'sessionHasExam_id',
                                    'exam_id',
                                    'session_id'
                                ]
                            }
                        }]
                    },
                    {
                        model: models['sessionUserOption'],
                        attributes: {
                            exclude: [
                                'option_id',
                                'exam_id',
                                'sessionUser_id'
                            ]
                        }
                    },
                    {
                        model: models['sessionExamHasExaminator'],
                        attributes: {
                            exclude: [
                                'sessionExamHasExaminator_id'
                            ]
                        },
                        include: [{
                            model: models['empowermentTests'],
                            attributes: {
                                exclude: [
                                    'empowermentTest_id',
                                    'user_id',
                                    'institut_id',
                                    'test_id'
                                ]
                            },
                            include: [{
                                model: models['User'],
                                attributes: {
                                    exclude: [
                                        'password',
                                        'user_id',
                                        'firstlanguage_id',
                                        'systemRole_id'
                                    ]
                                },
                            }]
                        }]
                    }];

                    // parameters.raw = true;
                    // parameters.nest = true;

                    const allInformations = await models['sessionUser'].findOne(parameters);

                    return JSON.parse(JSON.stringify(allInformations));

                } catch (error) {

                    const message = `An error has occured finding all the informations from sessionUser_id`;
                    return res.status(500).json({ message, data: error.message })
                }
            }


            async function generateFile(csvItems, allInformations) {
                try {


                    const arrayOfFields = Object.values(csvItems).map((item) => (
                        item.field
                    ));

                    console.log(arrayOfFields);

                    // Première ligne avec les fields

                    let csv = arrayOfFields.join(";");
                    csv += "\n";

                    let sessionUser = allInformations?.User;
                    let json = { ...allInformations };
                    delete json.informations;
                    delete json.hasPaid;
                    delete json.inscription;
                    delete json.numInscrAnt;
                    delete json.paymentMode;
                    delete json.sessionUser_id;
                    delete json.session_id;
                    delete json.user_id;
                    json["sessionUser"] = sessionUser;


                    // On veux user firstname
                    // Pour chaque field du template
                    csvItems.forEach((item) => {
                        // On créer un tableau pour insérer dans la ligne
                        const row = [];
                        // On va ensuite checker la table pour pas confondre les fields de même noms
                        switch (item.table) {
                            case "User":
                                row.push(json?.User[item.field]);
                                break;

                            case "Session":
                                row.push(json?.Session[item.field]);
                                break;

                            case "sessionExamHasExaminators":
                                row.push(json?.sessionExamHasExaminators[item.field]);
                                break;

                            case "sessionUser":
                                row.push(json?.sessionUser[item.field]);
                                break;

                            case "sessionUserOptions":
                                row.push(json?.sessionUserOptions[item.field]);
                                break;

                            default:
                                row.push("undefined");
                        }

                        csv = csv + row.join(";");
                        csv = csv +"\n";
                    })

                    console.log("\n\n", csv, '\n\n');

                    const messagefdg = `ok`;
                    return res.status(200).json({ messagefdg, data: csv })

                    /*
                      {
    "User": {
        "login": "bauer",
        "email": "bbauer02@gmail.com",
        "phone": "+330323522248",
        "civility": 1,
        "gender": 1,
        "firstname": "Baptiste",
        "lastname": "Bauer",
        "adress1": "30 rue Robert Leroux",
        "adress2": "",
        "zipcode": "02000",
        "city": "LAON",
        "country_id": 76,
        "birthday": "1982-08-04",
        "nationality_id": 76,
        "createdAt": "2021-09-07T13:20:34.000Z",
        "updatedAt": "2021-09-07T13:20:34.000Z",
        "country": {
            "label": "France"
        },
        "nationality": {
            "label": "French"
        },
        "firstlanguage": {
            "name": "Pashto"
        }
    },
    "Session": {
        "start": "2021-06-01T07:00:00.000Z",
        "end": "2021-06-05T15:00:00.000Z",
        "limitDateSubscribe": "2021-05-31T21:59:00.000Z",
        "placeAvailable": 3,
        "validation": true,
        "sessionHasExams": [
            {
                "adressExam": "Reims - Lycée Roosevelt",
                "room": "B16",
                "DateTime": "2021-07-03T07:00:00.000Z"
            },
            {
                "adressExam": "Reims - Lycée Roosevelt",
                "room": "B16",
                "DateTime": "2021-07-03T08:00:00.000Z"
            },
            {
                "adressExam": "Reims - Lycée Roosevelt",
                "room": "B16",
                "DateTime": "2021-07-03T09:00:00.000Z"
            }
        ]
    },
    "sessionUserOptions": [
        {
            "user_price": null,
            "addressExam": null,
            "isCandidate": true,
            "DateTime": null
        },
        {
            "user_price": null,
            "addressExam": null,
            "isCandidate": true,
            "DateTime": null
        },
        {
            "user_price": null,
            "addressExam": null,
            "isCandidate": true,
            "DateTime": null
        }
    ],
    "sessionExamHasExaminators": [
        {
            "sessionHasExam_id": 2,
            "sessionUser_id": 2,
            "empowermentTest_id": 1,
            "empowermentTest": {
                "code": "FJGCI87",
                "User": {
                    "login": "didierM",
                    "email": "didierMoulard@gmail.com",
                    "phone": "1234567899",
                    "civility": 1,
                    "gender": 1,
                    "firstname": "Didier",
                    "lastname": "Moulard",
                    "adress1": "2 rue du Louvres",
                    "adress2": null,
                    "zipcode": "51100",
                    "city": "REIMS",
                    "country_id": 76,
                    "birthday": "1987-11-14",
                    "nationality_id": 76,
                    "createdAt": "2021-09-07T13:20:35.000Z",
                    "updatedAt": "2021-09-07T13:20:35.000Z"
                }
            }
        },
        {
            "sessionHasExam_id": 3,
            "sessionUser_id": 2,
            "empowermentTest_id": 1,
            "empowermentTest": {
                "code": "FJGCI87",
                "User": {
                    "login": "didierM",
                    "email": "didierMoulard@gmail.com",
                    "phone": "1234567899",
                    "civility": 1,
                    "gender": 1,
                    "firstname": "Didier",
                    "lastname": "Moulard",
                    "adress1": "2 rue du Louvres",
                    "adress2": null,
                    "zipcode": "51100",
                    "city": "REIMS",
                    "country_id": 76,
                    "birthday": "1987-11-14",
                    "nationality_id": 76,
                    "createdAt": "2021-09-07T13:20:35.000Z",
                    "updatedAt": "2021-09-07T13:20:35.000Z"
                }
            }
        },
        {
            "sessionHasExam_id": 4,
            "sessionUser_id": 2,
            "empowermentTest_id": 1,
            "empowermentTest": {
                "code": "FJGCI87",
                "User": {
                    "login": "didierM",
                    "email": "didierMoulard@gmail.com",
                    "phone": "1234567899",
                    "civility": 1,
                    "gender": 1,
                    "firstname": "Didier",
                    "lastname": "Moulard",
                    "adress1": "2 rue du Louvres",
                    "adress2": null,
                    "zipcode": "51100",
                    "city": "REIMS",
                    "country_id": 76,
                    "birthday": "1987-11-14",
                    "nationality_id": 76,
                    "createdAt": "2021-09-07T13:20:35.000Z",
                    "updatedAt": "2021-09-07T13:20:35.000Z"
                }
            }
        }
    ],
    "sessionUser": {
        "login": "bauer",
        "email": "bbauer02@gmail.com",
        "phone": "+330323522248",
        "civility": 1,
        "gender": 1,
        "firstname": "Baptiste",
        "lastname": "Bauer",
        "adress1": "30 rue Robert Leroux",
        "adress2": "",
        "zipcode": "02000",
        "city": "LAON",
        "country_id": 76,
        "birthday": "1982-08-04",
        "nationality_id": 76,
        "createdAt": "2021-09-07T13:20:34.000Z",
        "updatedAt": "2021-09-07T13:20:34.000Z",
        "country": {
            "label": "France"
        },
        "nationality": {
            "label": "French"
        },
        "firstlanguage": {
            "name": "Pashto"
        }
    }
}
                    */

                    /*
                    const parser = new Parser({ arrayOfFields });
                    const csv = parser.parse(allInformations);
                    */

                    console.log("\n\n", csv, "\n\n");

                    /*
                    res.attachment('allInformations.csv')
                    res.status(200).send(csv);
                    */

                } catch (error) {

                    const message = `An error has occured finding all the informations from sessionUser_id`;
                    return res.status(500).json({ message, data: error.message })
                }
            }


            try {
                // Charge le template
                const csvItemsFound = await getAllItemCsvByTest();

                // On prend toutes les informations nécéssaire pour le csv
                const allInformations = await getAllInformations();

                // On génére le fichier csv, filtrés par les csvItemsFound
                await generateFile(csvItemsFound, allInformations)

            } catch (error) {
                const message = `An error has occured.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
    );
}
