const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const cliProgress = require('cli-progress');
const filebasename = path.basename(__filename);
const models = {};
const _colors = require('colors');
const {createRepositoryWithName} = require("../services/manageFileSystem");
const {destroyFolder} = require("../services/manageFileSystem");
const {MockDatas} =  require('../db/mock-class') ;


const progressBar = (label,length) => {
    const bar = new cliProgress.SingleBar({
        format: label + _colors.white('{bar}') + ' {percentage}%  ',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: false
    });
    bar.start(length, 0, {
        speed: "N/A"
    });

    return bar;
}
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
        let isDev = true;
        const mode = process.env.NODE_ENV;
        if(mode === "production") {
            isDev = false;
        }
        // force: isDev

        await sequelize.sync({ force: isDev, alter: true });
        console.log('\x1b[36m%s\x1b[0m',"~ La base de données est en cours de création .... ~");
        
        
        const mock = new MockDatas();
        await mock.initialize();
        //countries
        await models['Country'].bulkCreate(mock.countries);
        console.log('Table `Country` ................................... OK');
        //languages
        await models['Language'].bulkCreate(mock.languages);
        console.log('Table `Language` ................................... OK');
        //roles
        await models['Role'].bulkCreate(mock.roles);
        console.log('Table `Role` ................................... OK');
        //tests
        await models['Test'].bulkCreate(mock.tests);
        console.log('Table `Test` ................................... OK');
        //levels
        await models['Level'].bulkCreate(mock.levels);
        console.log('Table `Level` ................................... OK');
        //itemsCsv
        await models['csvItem'].bulkCreate(mock.itemsCsv);
        console.log('Table `csvItem` ................................... OK');
        //instituts
        await models['Institut'].bulkCreate(mock.instituts);
        console.log('Table `Institut` ................................... OK');
        //defaultUsers 
        //randomUsers
        await models['User'].bulkCreate([...mock.defaultUsers, ...mock.randomUsers]);
        console.log('Table `User` ................................... OK');
        //institutHasDefaultUsers
        //institutHasRandomUsers
        await models['institutHasUser'].bulkCreate([...mock.institutHasDefaultUsers,...mock.institutHasRandomUsers]);
        console.log('Table `institutHasUser` ................................... OK');
        //sessions
        await models['Session'].bulkCreate(mock.sessions);
        console.log('Table `Session` ................................... OK');
        //sessionHasUsers
        await models['sessionUser'].bulkCreate(mock.sessionHasUsers);
        console.log('Table `sessionUser` ................................... OK');
        //skills
        await models['Skill'].bulkCreate(mock.skills);
        console.log('Table `Skill` ................................... OK');
        //exams 
        await models['Exam'].bulkCreate(mock.exams);
        console.log('Table `Exam` ................................... OK');
        //sessionHasExams
        await models['sessionHasExam'].bulkCreate(mock.sessionHasExams);
        console.log('Table `sessionHasExam` ................................... OK');
        //empowerments
        await models['empowermentTests'].bulkCreate(mock.empowerments);
        console.log('Table `empowermentTests` ................................... OK');
        //sessionExamsExaminators
        await models['sessionExamHasExaminator'].bulkCreate(mock.sessionExamsExaminators);
        console.log('Table `sessionExamHasExaminator` ................................... OK');
        //institutHasPrices
        await models['InstitutHasPrices'].bulkCreate(mock.institutHasPrices);
        console.log('Table `InstitutHasPrices` ................................... OK');
        //sessionUserOption
        await models['sessionUserOption'].bulkCreate(mock.sessionUserOption);
        console.log('Table `sessionUserOption` ................................... OK');
            // Suppression des Templates
            await destroyFolder('templates');
            createRepositoryWithName('templates');
        console.log(_colors.green("API en écoute ..."));
    } catch (error) {
        throw error;
    }
}

module.exports = {initDB, models}