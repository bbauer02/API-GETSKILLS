const fs = require('fs');
const { Op } = require("sequelize");
const path = require('path');
const DataTypes = require('sequelize');
const filebasename = path.basename(__filename);
const models = {};
const _colors = require('colors');
const {createRepositoryWithName} = require("../services/manageFileSystem");
const {destroyFolder} = require("../services/manageFileSystem");
const {MockDatas} =  require('../db/mock-class') ;

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
       // isDev = false
        await sequelize.sync({ force: true, alter: true });
 
        if(isDev) {
            console.log('\x1b[36m%s\x1b[0m',"~ La base de données est en cours de création .... ~");
            const mock = new MockDatas();
            await mock.initialize();
            //countries
            await models['Country'].bulkCreate(mock.countries);
            console.log('Table `Country` ..................... OK');
            //languages
            await models['Language'].bulkCreate(mock.languages);
            console.log('Table `Language` .................... OK');
            //roles
            await models['Role'].bulkCreate(mock.roles);
            console.log('Table `Role` ........................ OK');
            //tests
            await models['Test'].bulkCreate(mock.tests);
            console.log('Table `Test` ........................ OK');
            //levels
            await models['Level'].bulkCreate(mock.levels);
            console.log('Table `Level` ....................... OK');
            //itemsCsv
            await models['csvItem'].bulkCreate(mock.itemsCsv);
            console.log('Table `csvItem` ..................... OK');
            //instituts
            await models['Institut'].bulkCreate(mock.instituts);
            console.log('Table `Institut` .................... OK');
            //defaultUsers 
            //randomUsers
            await models['User'].bulkCreate([...mock.defaultUsers, ...mock.randomUsers]);
            console.log('Table `User` ........................ OK');
            //institutHasDefaultUsers
            //institutHasRandomUsers
            await models['institutHasUser'].bulkCreate([...mock.institutHasDefaultUsers,...mock.institutHasRandomUsers]);
            console.log('Table `institutHasUser` ............. OK');
            //sessions
            await models['Session'].bulkCreate(mock.sessions);
            console.log('Table `Session` ..................... OK');
            //sessionHasUsers
            await models['sessionUser'].bulkCreate(mock.sessionHasUsers);
            console.log('Table `sessionUser` ................. OK');
            //skills
            await models['Skill'].bulkCreate(mock.skills);
            console.log('Table `Skill` ....................... OK');
            //exams 
            await models['Exam'].bulkCreate(mock.exams);
            console.log('Table `Exam` ........................ OK');
            //sessionHasExams
            await models['sessionHasExam'].bulkCreate(mock.sessionHasExams);
            console.log('Table `sessionHasExam` .............. OK');
            //empowerments
            await models['empowermentTests'].bulkCreate(mock.empowerments);
            console.log('Table `empowermentTests` ............ OK');
            //sessionExamsExaminators
            await models['sessionExamHasExaminator'].bulkCreate(mock.sessionExamsExaminators);
            console.log('Table `sessionExamHasExaminator` .... OK');
            //institutHasPrices
            await models['InstitutHasPrices'].bulkCreate(mock.institutHasPrices);
            console.log('Table `InstitutHasPrices` ........... OK');
            //sessionUserOption
            await models['sessionUserOption'].bulkCreate(mock.sessionUserOption);
            console.log('Table `sessionUserOption` ........... OK');
            //invoices + invoiceLines
            console.log('Table `invoices` ........... OK');
            await models['Invoice'].bulkCreate(mock.invoices);
            console.log('Table `invoice_lines` ........... OK');
            await models['InvoiceLines'].bulkCreate(mock.invoice_lines);
            // Suppression des Templates
            await destroyFolder('templates');
            createRepositoryWithName('templates');
        }
        else {
            const users = await models['User'].findAll({
                where: {
                    systemRole_id : {
                        [Op.gte] :5
                    }
                }
            });
            if(users.length <= 0 ) {
                // On va remplir la BDD avec des valeurs par default
                console.log('\x1b[36m%s\x1b[0m',"~ Première installation ..... ~");
                console.log('\x1b[36m%s\x1b[0m',"~ La base de données est en cours de création .... ~");

                const mock = new MockDatas();
                await mock.initialize();
                //countries
                await models['Country'].bulkCreate(mock.countries);
                console.log('Table `Country` ..................... OK');
                //languages
                await models['Language'].bulkCreate(mock.languages);
                console.log('Table `Language` .................... OK');
                //roles
                await models['Role'].bulkCreate(mock.roles);
                console.log('Table `Role` ........................ OK');
                //tests
                await models['Test'].bulkCreate(mock.tests);
                console.log('Table `Test` ........................ OK');
                //levels
                await models['Level'].bulkCreate(mock.levels);
                console.log('Table `Level` ....................... OK');
                //itemsCsv
                await models['csvItem'].bulkCreate(mock.itemsCsv);
                console.log('Table `csvItem` ..................... OK');
                await models['User'].create(mock.defaultAdminProd);
                console.log('Table `User` ........................ OK');
                console.log("");
                console.log("");
                console.log(_colors.red("*****!!! WARNING !!!*******"));
                console.log(_colors.red("* user default: admin     *"));
                console.log(_colors.red("* password default: admin *"));
                console.log(_colors.red("* Don't Forget to Change  *"));
                console.log(_colors.red("***************************"));
                console.log("");
                console.log("");
            }
            
        } 
        console.log("");
        console.log(_colors.green("API en écoute ..."));
    } catch (error) {
        throw error.message;
    }
}

module.exports = {initDB, models}