require('./crons');
const fs = require('fs');
const https = require('https');
const config = require('./config.prod');
const express = require('express');
const sequelize = require('./src/db/sequelize');
const models = require('./src/models');
const app = express();
const cors = require('cors');
const port = config.port | 3003;
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const _colors = require('colors');


const { privateKeyPath, certificatePath } = config;



const corsConfig = {
    origin: true,
    credentials: true,
};




app
    .use(express.urlencoded({extended: true}))
    .use(express.json({
        verify: (req, res, buffer) => req['rawBody'] = buffer,
    }))
    .use(cors(corsConfig))
    .use(cookieParser())
    .use(fileUpload())
    .use('/api/avatars', express.static(__dirname + '/public/images/avatars/'))

// Initialisation de la BDD
 models.initDB(sequelize);

app.get('/', (req, res) => {
    res.json('Hello, API ! ');
});

// Points de terminaison
// Login

require('./src/routes/login')(app);

// Countries
require('./src/routes/country/findAllCountries')(app);
require('./src/routes/country/findCountryByPk')(app);

// Languages
require('./src/routes/language/findAllLanguages')(app);
require('./src/routes/language/findLanguageByPk')(app);

// Roles
require('./src/routes/role/findAllRoles')(app);
require('./src/routes/role/findRoleByPk')(app);

// Users
require('./src/routes/user/findUserByPk')(app);
require('./src/routes/user/findUserByEmail')(app);
require('./src/routes/user/findAllUsers')(app);
require('./src/routes/user/createUser')(app);
require('./src/routes/user/updateUser')(app);
require('./src/routes/user/deleteUser')(app);
require('./src/routes/user/findUserByEmailOrLogin')(app);
require('./src/routes/user/registerUser')(app);

// UserEmpowerment
require('./src/routes/empowerementTests/createEmpowerementTests')(app);
require('./src/routes/empowerementTests/deleteEmpowerementTests')(app);
require('./src/routes/empowerementTests/findEmpowermentTestsByPk')(app);
require('./src/routes/empowerementTests/updateEmpowermentTests')(app);
require('./src/routes/empowerementTests/findEmpowermentTestsByInstituts')(app);

// Institut
require('./src/routes/institut/findAllInstituts')(app);
require('./src/routes/institut/findInstitutByPk')(app);
require('./src/routes/institut/createInstitut')(app);
require('./src/routes/institut/updateInstitut')(app);
require('./src/routes/institut/deleteInstitut')(app);
require('./src/routes/institut/subscribeInstitut')(app);
require('./src/routes/institut/generateStripeAccountLink')(app);

// Institut Users
require('./src/routes/institutUser/addInstitutUser')(app);
require('./src/routes/institutUser/deleteInstitutUser')(app);
require('./src/routes/institutUser/findInstitutExaminators')(app);
require('./src/routes/institutUser/findInstitutUser')(app);
require('./src/routes/institutUser/findInstitutUsers')(app);
require('./src/routes/institutUser/updateInstitutUser')(app);

// Levels
require('./src/routes/level/findAllLevels')(app);
require('./src/routes/level/findLevelByPk')(app);
require('./src/routes/level/createLevel')(app);
require('./src/routes/level/deleteLevel')(app);
require('./src/routes/level/updateLevel')(app);
require('./src/routes/level/archiveLevels')(app);

// Tests
require('./src/routes/test/findAllTests')(app);
require('./src/routes/test/findTestByPk')(app);
require('./src/routes/test/createTest')(app);
require('./src/routes/test/updateTest')(app);
require('./src/routes/test/deleteTest')(app);
require('./src/routes/test/archiveChildTests')(app);
require('./src/routes/test/archiveTests')(app);
require('./src/routes/test/findAllVariations')(app);
require('./src/routes/test/findAllTestsAndVariations')(app);

// Sessions
require('./src/routes/session/findAllSessions')(app);
require('./src/routes/session/findSessionByPk')(app);
require('./src/routes/session/createSession')(app);
require('./src/routes/session/deleteSession')(app);
require('./src/routes/session/updateSession')(app);
require('./src/routes/session/updateSessionAdmin')(app);
require('./src/routes/session/findAllSessionsByInstituts')(app);

// SessionUsers
require('./src/routes/sessionUser/addSessionUser')(app);
require('./src/routes/sessionUser/addSessionUserOption')(app);
require('./src/routes/sessionUser/deleteSessionUser')(app);
require('./src/routes/sessionUser/findSessionUser')(app);
require('./src/routes/sessionUser/findSessionUsers')(app);
require('./src/routes/sessionUser/updateSessionUser')(app);
require('./src/routes/sessionUser/updateSessionUserOption')(app);
require('./src/routes/sessionUser/deleteSessionUserOption')(app);

// SessionHasExams
require('./src/routes/sessionHasExam/createSessionHasExam')(app);
require('./src/routes/sessionHasExam/deleteSessionHasExam')(app);
require('./src/routes/sessionHasExam/findAllSessionHasExams')(app);
require('./src/routes/sessionHasExam/findSessionHasExamByPk')(app);
require('./src/routes/sessionHasExam/updateSessionHasExam')(app);

// SessionExamHasExaminators
require('./src/routes/sessionExamHasExaminator/createSessionExamHasExaminator')(app);
require('./src/routes/sessionExamHasExaminator/deleteSessionExamHasExaminator')(app);
require('./src/routes/sessionExamHasExaminator/findSessionExamHasExaminatorsBySessionExam')(app);
require('./src/routes/sessionExamHasExaminator/updateSessionExamHasExaminator')(app);

// Sessions Archive
require('./src/routes/sessionHist/findAllSessionsHistByInstituts')(app);

// Skills
require('./src/routes/skill/findAllSkills')(app);
require('./src/routes/skill/createSkill')(app);
require('./src/routes/skill/updateSkill')(app);
require('./src/routes/skill/deleteSkill')(app);

// Exams
require('./src/routes/exam/findAllExams')(app);
require('./src/routes/exam/createExam')(app);
require('./src/routes/exam/deleteExam')(app);
require('./src/routes/exam/updateExam')(app);
require('./src/routes/exam/findExamByPk')(app);

// Export 
require('./src/routes/csvItem/exportCsv')(app);

// Account
require('./src/routes/account/myAccount')(app);

// Stats
require('./src/routes/stats/statsUsers')(app);

// Exams Prices
require('./src/routes/institutHasPrices/getAllInstitutHasPrices')(app);
require('./src/routes/institutHasPrices/createInstitutHasPrices')(app);
require('./src/routes/institutHasPrices/deleteInstitutHasPrices')(app);
require('./src/routes/institutHasPrices/updateInstitutHasPrices')(app);

// Payment
require('./src/routes/payment/createCheckoutSession')(app);
require('./src/routes/payment/webhooks')(app);

// Documents
require('./src/routes/documents/createNewDoc')(app);
require('./src/routes/documents/deleteDoc')(app);
require('./src/routes/documents/getDocsTypes')(app);
require('./src/routes/documents/getDocsDatas')(app);
require('./src/routes/documents/getDoc')(app);

// INVOICES
require('./src/routes/invoice/getInvoicesByInstitut')(app);
require('./src/routes/invoice/createInvoiceByInstitut')(app);
require('./src/routes/invoice/updateInvoiceByInstitut')(app);
require('./src/routes/invoice/deleteInvoiceByInstitut')(app);
require('./src/routes/invoice/newInvoice')(app);
require('./src/routes/invoice/getInvoicePdf')(app);

// csvItems
require('./src/routes/csvItem/createCsvItem')(app);
require('./src/routes/csvItem/deleteCsvItem')(app);
require('./src/routes/csvItem/findCsvItemByTest')(app);

require('./src/routes/documents/testRequete')(app);


if(privateKeyPath !== '' && certificatePath !== '' && 
privateKeyPath !== null && certificatePath !== null  &&
privateKeyPath !== undefined && certificatePath !== undefined ) {

    const credentialsHttps = {
        key: fs.readFileSync(privateKeyPath),
        cert: fs.readFileSync(certificatePath),
    };

    const httpsServer = https.createServer(credentialsHttps, app);
    httpsServer.listen(port, () => {
        console.log(_colors.yellow(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`));
        console.log(_colors.yellow(`~ API GET-TESTED.ONLINE est démarrée sur le port : `) + _colors.green(`${port}`));
        console.log(_colors.yellow(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`));
        console.log(_colors.yellow("HTTPS : ") + _colors.green("ON"));
        console.log(_colors.yellow("En mode : ") + _colors.green(process.env.NODE_ENV.toUpperCase()));
    });

}
else{
    
    app.listen(port, () => {
        console.log(_colors.yellow(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`));
        console.log(_colors.yellow(`~ API GET-TESTED.ONLINE est démarrée sur le port : `) + _colors.green(`${port}`));
        console.log(_colors.yellow(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`));
        console.log(_colors.yellow("HTTPS : ") + _colors.green("OFF"));
        console.log(_colors.yellow("En mode : ") + _colors.green(process.env.NODE_ENV.toUpperCase()));
    });

}

