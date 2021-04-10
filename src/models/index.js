const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const filebasename = path.basename(__filename);
const models = {};

// Jeux de données
const countries = require('../db/mock-countries');
const roles = require('../db/mock-roles');

const levels = require('../db/mock-level');
const tests = require('../db/mock-test');
const users = require('../db/mock-user');


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
  
    //db.sequelize = sequelize;
    //db.Sequelize = Sequelize;
    try {
        await sequelize.sync({force:true})
        console.log("La base de données est synchronisée !")
        // Remplissage des tables avec des données tests. 

        // FILL TABLE 'countries' / 'languages' / 'nationality'
        for(const country of countries) {
            const Country = await models['Country'].create({
                label:country.en_short_name,
                inhabitant:country.nationality,
                language:country.nationality,
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


        // TABLE 'users'
       /* for (const user of users) {
            await models['User'].create({
                role_id: user.role_id,
                login: user.login,
                password:user.password,
                email: user.email,
                firstname: user.firstname,
                lastname : user.lastname,
                adress1:user.adress1,
                address2: user.adress2,
                zipcode: user.zipcode,
                city: user.city,
                country: user.country,
                birthday: user.birthday,
                nationnality: user.nationnality,
                firstlanguage: user.firstlanguage
            });
        }
*/

        // TABLE 'levels'
        for(const level of levels) {
            await models['Level'].create({
                label:level.label,
                ref: level.ref,
                description: level.description
            });
        }
        // TABLE 'tests'
        for(const test of tests) {
            const oneTest = await models['Test'].create({
                label:       test.label,
                isInternal:  test.isInternal,
                parent_id:   test.parent_id
            }); 
            if(test.levels && test.levels.length > 0) {
               // const lastTest = await db['Test'].findByPk(oneTest.id);
               oneTest.setLevels(test.levels);
            }   
        }
     }
     catch(error) {
         throw error;
     }
}

module.exports = {initDB,models }



