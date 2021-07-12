const express = require('express');
const sequelize = require('./src/db/sequelize');
const models = require('./src/models');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
 


app
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors())
    .use(cookieParser())

// Initialisation de la BDD
models.initDB(sequelize);
app.get('/', (req, res) => {
    res.json('Hello, Heroku ! ');
});

// Points de terminaison
// Login

require('./src/routes/login')(app);

// Countries
require('./src/routes/country/findAllCountries')(app);
require('./src/routes/country/findCountryByPk')(app);

// Roles
require('./src/routes/role/findAllRoles')(app);
require('./src/routes/role/findRoleByPk')(app);

// Users
require('./src/routes/user/findUserByPk')(app);
require('./src/routes/user/findAllUsers')(app);
require('./src/routes/user/createUser')(app);
require('./src/routes/user/updateUser')(app);
require('./src/routes/user/deleteUser')(app);


//Institutes
require('./src/routes/institut/findAllInstituts')(app);
require('./src/routes/institut/findInstitutByPk')(app);
require('./src/routes/institut/createInstitut')(app);
require('./src/routes/institut/updateInstitut')(app);
require('./src/routes/institut/deleteInstitut')(app);
require('./src/routes/institut/addUserInstitut')(app);
require('./src/routes/institut/deleteUserInstitut')(app);
require('./src/routes/institut/findInstitutUsers')(app);

// Levels
require('./src/routes/level/findAllLevels')(app);
require('./src/routes/level/findLevelByPk')(app);
require('./src/routes/level/createLevel')(app);
require('./src/routes/level/deleteLevel')(app);
require('./src/routes/level/updateLevel')(app);

// Tests
require('./src/routes/test/findAllTests')(app);
require('./src/routes/test/findTestByPk')(app);
require('./src/routes/test/createTest')(app);
require('./src/routes/test/updateTest')(app);
require('./src/routes/test/deleteTest')(app);

// Sessions
require('./src/routes/session/findAllSessions')(app);
require('./src/routes/session/findSessionByPk')(app);
require('./src/routes/session/createSession')(app);
require('./src/routes/session/deleteSession')(app);
require('./src/routes/session/deleteUserSession')(app);
require('./src/routes/session/updateSession')(app);
require('./src/routes/session/addUserSession')(app);
require('./src/routes/session/updateUserSession')(app);
require('./src/routes/session/findAllSessionsByInstituts')(app);

// Exams
require('./src/routes/exam/findAllExams')(app);
require('./src/routes/exam/createExam')(app);
require('./src/routes/exam/deleteExam')(app);
require('./src/routes/exam/updateExam')(app);
require('./src/routes/exam/findExamByPk')(app);

// Account
require('./src/routes/account/myAccount')(app);
 
// Stats
require('./src/routes/stats/statsUsers')(app);

app.listen(port, () => console.log(`***********************************************************\n*   API GET-TESTED.ONLINE est démarrée : localhost:${port}   *\n***********************************************************`));