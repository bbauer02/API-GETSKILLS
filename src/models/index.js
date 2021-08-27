const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const bcrypt = require('bcrypt');
const filebasename = path.basename(__filename);
const models = {};

// Jeux de données
const countries = require('../db/mock-countries');
const languages = require('../db/mock-languages');
const roles = require('../db/mock-roles');
const levels = require('../db/mock-levels');
const tests = require('../db/mock-tests');
const users = require('../db/mock-users');
const instituts = require('../db/mock-instituts');
const sessions = require('../db/mock-sessions');
const sessionsHist = require('../db/mock-sessionsHist');
const sessionUsers = require('../db/mock-session_has_user');
const exams = require('../db/mock-exams');
const skills = require("../db/mock-skills");
const prices_exams = require("../db/mock-instituts_has_prices");
const INSTITUT_HAS_PRICES = require("../db/mock-prices_exams");
const sessionHasExams = require('../db/mock-session_has_exam');
const empowerments = require('../db/mock-empowerment');

const initDB = async (sequelize) => {
    fs
        .readdirSync(__dirname)
        .filter((file) => {
            const returnFile = (file.indexOf('.') !== 0)
                && (file !== filebasename)
                && (file.slice(-3) === '.js');
            return returnFile;
        })
        .forEach(file => {
            const model = require(path.join(__dirname, file))(sequelize, DataTypes);
            models[model.name] = model;
        });

    Object.keys(models).forEach(modelName => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });

    try {
        await sequelize.sync({ force: true })
        console.log("La base de données est synchronisée !")
        // Remplissage des tables avec des données tests. 

        // FILL TABLE 'countries' / 'nationality'
        for (const country of countries) {
            const Country = await models['Country'].create({
                label: country.en_short_name,
                countryNationality: country.nationality,
                countryLanguage: country.nationality,
                code: country.alpha_2_code
            });
        }

        // FILL TABLE 'language'
        for (const language of languages) {
            const Language = await models['Language'].create({
                nativeName: language.nativeName,
                name: language.name
            });
        }

        // FILL TABLE 'ROLE'
        for (const role of roles) {
            const Role = await models['Role'].create({
                label: role.label,
                power: role.power
            });
        }
        // TABLE 'instituts'
        for (const institut of instituts) {
            await models['Institut'].create({
                label: institut.label,
                adress1: institut.adress1,
                adress2: institut.adress2,
                zipcode: institut.zipcode,
                city: institut.city,
                country_id: institut.country_id,
                email: institut.email,
                siteweb: institut.siteweb,
                phone: institut.phone,
                socialNetwork: institut.socialNetwork
            });
        }
        // TABLE 'users'
        //await bcrypt.hash(user.password, 10),
        for (const user of users) {
            const newUser = await models['User'].create({
                login: user.login,
                password: await bcrypt.hash(user.password, 2),
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                civility: user.civility,
                firstname: user.firstname,
                lastname: user.lastname,
                adress1: user.adress1,
                adress2: user.adress2,
                zipcode: user.zipcode,
                city: user.city,
                country_id: user.country_id,
                birthday: user.birthday,
                nationality_id: user.nationality_id,
                firstlanguage_id: user.firstlanguage_id,
                systemRole_id: user.systemRole_id
            });
        }
        // TABLE 'institutHasUser'
        await models['institutHasUser'].bulkCreate([
            { 'user_id': 1, 'institut_id': 2, 'role_id': 1 },
            { 'user_id': 1, 'institut_id': 1, 'role_id': 1 },
            { 'user_id': 2, 'institut_id': 1, 'role_id': 4 },
            { 'user_id': 3, 'institut_id': 2, 'role_id': 1 },
            { 'user_id': 4, 'institut_id': 2, 'role_id': 2 }
        ]);

        // TABLE 'tests'
        for (const test of tests) {
            await models['Test'].create({
                label: test.label,
                isInternal: test.isInternal,
                parent_id: test.parent_id
            });
        }

        // TABLE 'levels'
        for (const level of levels) {
            await models['Level'].create({
                label: level.label,
                ref: level.ref,
                description: level.description,
                test_id: level.test_id
            });
        }

        // TABLE 'sessions'
        for (const session of sessions) {
            await models['Session'].create({
                institut_id: session.institut_id,
                start: session.start,
                end: session.end,
                limitDateSubscribe: session.limitDateSubscribe,
                placeAvailable: session.placeAvailable,
                validation: session.validation,
                test_id: session.test_id,
                level_id: session.level_id
            });
        }

        // TABLE 'sessionsHist'
        for (const session of sessionsHist) {
            await models['SessionHist'].create({
                institut_id: session.institut_id,
                start: session.start,
                end: session.end,
                limitDateSubscribe: session.limitDateSubscribe,
                placeAvailable: session.placeAvailable,
                validation: session.validation,
                test_id: session.test_id,
                level_id: session.level_id
            });
        }

        // TABLE 'sessionUsers'
        for (const sessionUser of sessionUsers) {
            await models['sessionUser'].create({
                session_id: sessionUser.session_id,
                user_id: sessionUser.user_id,
                paymentMode: sessionUser.paymentMode,
                numInscrAnt: sessionUser.numInscrAnt,
                inscription: sessionUser.inscription,
                hasPaid: sessionUser.hasPaid,
                informations: sessionUser.informations
            });
        }

        // TABLE 'skill'
        for (const skill of skills) {
            await models['Skill'].create({
                skill_id: skill.skill_id,
                label: skill.label,
                parent_id: skill.parent_id,
            })
        }


        // TABLE 'exam'
        for (const exam of exams) {
            await models['Exam'].create({
                test_id: exam.test_id,
                level_id: exam.level_id,
                label: exam.label,
                isWritten: exam.isWritten,
                isOption: exam.isOption,
                price: exam.price,
                coeff: exam.coeff,
                nbrQuestions: exam.nbrQuestions,
                duration: exam.duration,
                successScore: exam.successScore
            });
        }

        // TABLE 'sessionHasExam'
        for (const sessionHasExam of sessionHasExams) {
            await models['sessionHasExam'].create({
                adressExam: sessionHasExam.adressExam,
                DateTime: sessionHasExam.DateTime,
                session_id: sessionHasExam.session_id,
                exam_id: sessionHasExam.exam_id,
                user_id: sessionHasExam.user_id,
            });
        }

        // TABLE 'empowermentTests'
        for (const empowerment of empowerments) {
            await models['empowermentTests'].create({
                institut_id: empowerment.institut_id,
                user_id: empowerment.user_id,
                test_id: empowerment.test_id,
                code: empowerment.code
            });
        }

        // TABLE 'Institut_has_prices'
        for (const price of INSTITUT_HAS_PRICES) {
            await models['InstitutHasPrices'].create({
                institut_id: price.institut_id,
                exam_id: price.exam_id,
                price: price.price
            });
        }

        // TABLE 'sessionUserOption'
        await models['sessionUserOption'].bulkCreate([
            {
                'exam_id': 8,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 1
            },

            /* exams correspondent pas aux tests + niveaux ?
            {
                'exam_id': 3,
                'user_price': null,
                'addressExam': "INALCO 2 Rue de Lille, 75007 Paris",
                "DateTime": new Date(2021, 6, 1, 9, 00),
                "isCandidate": true,
                "sessionUser_id": 2
            },
            {
                'exam_id': 4,
                'user_price': null,
                'addressExam': "INALCO 2 Rue de Lille, 75007 Paris",
                "DateTime": new Date(2021, 6, 2, 9, 00),
                "isCandidate": true,
                "sessionUser_id": 2
            },
            {
                'exam_id': 5,
                'user_price': null,
                'addressExam': "INALCO 2 Rue de Lille, 75007 Paris",
                "DateTime": new Date(2021, 6, 3, 9, 00),
                "isCandidate": true,
                "sessionUser_id": 2
            },
            */

            // Session 2 JLPT N3 -> 3 epreuves pour Bauer Baptiste
            {
                'exam_id': 12,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 2
            },
            {
                'exam_id': 13,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 2
            },
            {
                'exam_id': 14,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 2
            },

            // Session 2 JLPT N3 -> 3 epreuves pour Christophe Lefevre
            {
                'exam_id': 12,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 3
            },
            {
                'exam_id': 13,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 3
            },
            {
                'exam_id': 14,
                'user_price': null,
                'addressExam': null,
                "DateTime": null,
                "isCandidate": true,
                "sessionUser_id": 3
            }

        ]);
    } catch (error) {
        throw error;
    }
}

module.exports = { initDB, models }