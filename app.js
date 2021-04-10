const express = require('express');
const sequelize = require('./src/db/sequelize');
const models = require('./src/models');
const app = express();
const port = 3000;


/*DEV MOD*/
const morgan = require('morgan');
app
    .use(morgan('dev'))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())

// Initialisation de la BDD
models.initDB(sequelize);

// Points de terminaison
// Countries
require('./src/routes/country/findAllCountries')(app);

// Roles
require('./src/routes/role/findAllRoles')(app);
require('./src/routes/role/findRoleByPk')(app);


// Levels
require('./src/routes/level/findAllLevels')(app);
require('./src/routes/level/findLevelByPk')(app);
require('./src/routes/level/createLevel')(app);
require('./src/routes/level/deleteLevel')(app);
require('./src/routes/level/updateLevel')(app);

// Tests
require('./src/routes/test/findAllTests')(app);
require('./src/routes/test/findTestByPk')(app);


app.listen(port, () => console.log(`***********************************************************\n*   API GET-TESTED.ONLINE est démarrée : localhost:${port}   *\n***********************************************************`));