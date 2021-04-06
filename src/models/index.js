const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const filebasename = path.basename(__filename);
const models = {};

// Jeux de données
const levels = require('../db/mock-level');
const tests = require('../db/mock-test');

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



