const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const bcrypt = require('bcrypt');
const filebasename = path.basename(__filename);
const models = {};

// Jeux de données
const countries = require('../db/mock-countries');
const roles = require('../db/mock-roles');
const levels = require('../db/mock-levels');
const tests = require('../db/mock-tests');
const users = require('../db/mock-users');
const instituts = require('../db/mock-instituts');
const sessions = require('../db/mock-sessions');
const sessionUsers = require('../db/mock-session_has_user');
const exams = require('../db/mock-exams');

const initDB = async (sequelize) => {
    fs
    .readdirSync(__dirname)
    .filter( (file) => {
        const returnFile = (file.indexOf('.') !== 0) 
          && (file !== filebasename)
          && (file.slice(-3) === '.js');
          return returnFile;
    })
    .forEach(file => {
        const model = require(path.join(__dirname,file))(sequelize, DataTypes);
        models[model.name] = model;
    });
  
    Object.keys(models).forEach(modelName => {
        if(models[modelName].associate) {
            models[modelName].associate(models);
        }
    });
  
    try {
        await sequelize.sync({force:true})
        console.log("La base de données est synchronisée !")
        // Remplissage des tables avec des données tests. 

        // FILL TABLE 'countries' / 'languages' / 'nationality'
        for(const country of countries) {
            const Country = await models['Country'].create({
                label:country.en_short_name,
                countryNationality:country.nationality,
                countryLanguage:country.nationality,
                code:country.alpha_2_code
            });
        }

        // FILL TABLE 'ROLE'
        for(const role of roles) {
            const Role = await models['Role'].create({
                label: role.label,
                power: role.power
            });
        }
        // TABLE 'instituts'
        for(const institut of instituts) {
            await models['Institut'].create({
                label: institut.label,
                adress1:institut.adress1,
                adress2:institut.adress2,
                zipcode:institut.zipcode,
                city:institut.city,
                country_id:institut.country_id,
                email: institut.email,
                siteweb:institut.siteweb,
                phone: institut.phone,
                socialNetwork : institut.socialNetwork
            });
        }   
                // TABLE 'users'
                //await bcrypt.hash(user.password, 10),
                for (const user of users) {
                    const newUser = await models['User'].create({
                        role_id: user.role_id,
                        login: user.login,
                        password: await bcrypt.hash(user.password, 2),
                        email: user.email,
                        phone: user.phone,
                        gender:user.gender,
                        civility:user.civility,
                        firstname: user.firstname,
                        lastname : user.lastname,
                        adress1:user.adress1,
                        adress2: user.adress2,
                        zipcode: user.zipcode,
                        city: user.city,
                        country_id: user.country_id,
                        birthday: user.birthday,
                        nationality_id: user.nationality_id,
                        firstlanguage_id: user.firstlanguage_id
                    });
                }
                // TABLE 'institutHasUser'
                await models['institutHasUser'].bulkCreate([
                    { 'user_id' : 1, 'institut_id':2,'role_id': 5},
                    { 'user_id' : 2, 'institut_id':1,'role_id': 1}
                ]);

               // TABLE 'tests'
                for(const test of tests) {
                    await models['Test'].create({
                        label:       test.label,
                        isInternal:  test.isInternal,
                        parent_id:   test.parent_id
                    });  
                }

                // TABLE 'levels'
                for(const level of levels) {
                    await models['Level'].create({
                        label:level.label,
                        ref: level.ref,
                        description: level.description,
                        test_id:level.test_id
                    });
                }
                
                // TABLE 'sessions'
                for(const session of sessions) {
                    await models['Session'].create({
                        institut_id :session.institut_id,
                        start: session.start,
                        end: session.end,
                        limitDateSubscribe: session.limitDateSubscribe,
                        placeAvailable : session.placeAvailable,
                        test_id : session.test_id,
                        level_id: session.level_id
                    });
                }

                // TABLE 'sessionUsers'
                for(const sessionUser of sessionUsers) {
                    await models['sessionUser'].create({
                        session_id: sessionUser.session_id,
                        user_id: sessionUser.user_id,
                        paymentMode: sessionUser.paymentMode,
                        hasPaid: sessionUser.hasPaid,
                        informations: sessionUser.informations
                    });
                }




              // TABLE 'exam'
                for(const exam of exams) {
                    await models['Exam'].create({
                        test_id:exam.test_id,
                        level_id:exam.level_id,
                        label: exam.label,
                        isWritten: exam.isWritten,
                        isOption: exam.isOption,
                        price:exam.price,
                        coeff:exam.coeff,
                        nbrQuestions:exam.nbrQuestions,
                        duration: exam.duration,
                        successScore: exam.successScore
                    });
                }

                // TABLE 'sessionUserOption'
                await models['sessionUserOption'].bulkCreate([
                { 'exam_id' : 1, 'user_price':50, 'addressExam' : "Centre d'examen de LAON - Boulodrome 02000 LAON","DateTime" : new Date(2021, 5, 2, 9,00), "isCandidate" : true, "sessionUser_id" : 1},
                { 'exam_id' : 2, 'user_price':null, 'addressExam' : "Centre d'examen de LAON - Boulodrome 02000 LAON","DateTime" : new Date(2021, 5, 3, 9,00), "isCandidate" : true, "sessionUser_id" : 1},
                { 'exam_id' : 3, 'user_price':null, 'addressExam' : "INALCO 2 Rue de Lille, 75007 Paris","DateTime" : new Date(2021, 6, 1, 9,00), "isCandidate" : true, "sessionUser_id" : 2},
                { 'exam_id' : 4, 'user_price':null, 'addressExam' : "INALCO 2 Rue de Lille, 75007 Paris","DateTime" : new Date(2021, 6, 2, 9,00), "isCandidate" : true, "sessionUser_id" : 2},
                { 'exam_id' : 5, 'user_price':null, 'addressExam' : "INALCO 2 Rue de Lille, 75007 Paris","DateTime" : new Date(2021, 6, 3, 9,00), "isCandidate" : true, "sessionUser_id" : 2}

            ]);
     }
     catch(error) {
         throw error;
     }
}

module.exports = {initDB,models }



