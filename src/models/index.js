const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const bcrypt = require('bcrypt');
const cliProgress = require('cli-progress');
const filebasename = path.basename(__filename);
const models = {};

 
// Jeux de données
var faker = require('faker');

const countries = require('../db/mock-countries');
const languages = require('../db/mock-languages');
const roles = require('../db/mock-roles');
const levels = require('../db/mock-levels');
const tests = require('../db/mock-tests');
const users = require('../db/mock-users');
const instituts = require('../db/mock-instituts');
const itemsCsv = require('../db/mock-items_csv');
const _colors = require('colors');
const {createRepositoryWithName} = require("../services/manageFileSystem");
const {destroyFolder} = require("../services/manageFileSystem");

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

        await sequelize.sync({ force: isDev, alter: true });
        console.log('\x1b[36m%s\x1b[0m',"~ La base de données est en cours de création .... ~");
        console.log('\x1b[36m%s\x1b[0m',"## Ajout des données manquantes nécessaires au fonctionnement de l'application ....");
        
        const numCountry = await models['Country'].findAll({limit:1});
        const numLanguage = await models['Language'].findAll({limit:1});
        const numRole = await models['Role'].findAll({limit:1});
        const numTest = await models['Test'].findAll({limit:1});
        const numLevel = await models['Level'].findAll({limit:1});
        
        
        /**
         * FILL TABLE 'country' 
         */   
        if(numCountry.length === 0) {
            const barCountries =progressBar('#Ajout des pays.............................. ', countries.length );
            const countriesList = [];
            for (const country of countries) {
                countriesList.push({
                    label: country.en_short_name,
                    countryNationality: country.nationality,
                    countryLanguage: country.nationality,
                    code: country.alpha_2_code
                });
                barCountries.increment();
            }
            await models['Country'].bulkCreate(countriesList);
            barCountries.stop();
            console.log(_colors.green("OK"));
        }
          
        /**
         * FILL TABLE 'language' 
         */       
        if(numLanguage.length === 0)  { 
            const barLanguages =progressBar('#Ajout des langues........................... ', languages.length);
            const languagesList = [];
            for (const language of languages) {
                languagesList.push({
                    nativeName: language.nativeName,
                    name: language.name
                });
                barLanguages.increment();
            }
            const Language = await models['Language'].bulkCreate(languagesList);
            barLanguages.stop();
            console.log(_colors.green("OK"));
        }
        /**
         * FILL TABLE 'role' 
         */   
        if(numRole.length === 0) {
            const barRoles =progressBar('#Ajout des rôles............................. ', roles.length);
            const roleList = [];
            for (const role of roles) {
                roleList.push({
                    label: role.label,
                    power: role.power
                });
                barRoles.increment();
            }
            await models['Role'].bulkCreate(roleList);
            barRoles.stop();
            console.log(_colors.green("OK"));
        }                   
        /**
         * FILL TABLE 'tests'
         */ 
        const testList = [];
        if(numTest.length === 0) {
            const barTest =progressBar('#Ajout des tests............................. ', tests.length);
            let testid = 1;
            for (const test of tests) {
                testList.push({
                    test_id : testid,
                    label: test.label,
                    isInternal: test.isInternal,
                    parent_id: test.parent_id
                });
                testid++;
                barTest.increment();
            }
            barTest.stop();
            await models['Test'].bulkCreate(testList);
            console.log(_colors.green("OK"));
        }         
         /**
         * FILL TABLE 'levels'
         */  
        const levelList = [];
        if(numLevel.length===0) {
            const barLevels =progressBar('#Ajout des niveaux........................... ', levels.length);
            
            let levelId=1;
            for (const level of levels) {
                levelList.push({
                    level_id: levelId,
                    label: level.label,
                    ref: level.ref,
                    description: level.description,
                    test_id: level.test_id
                });
                levelId++;
                barLevels.increment();
            }
            barLevels.stop();
            await models['Level'].bulkCreate(levelList);
            console.log(_colors.green("OK"));
        }         

        /** 
            CREATION D'UN UTILISATEUR PAR DEFAULT
        */
        if(!isDev) {
            await models['User'].create({
                login: "admin", 
                password: await bcrypt.hash('admin', 2),
                email: "contact@get-skills.online",
                phone: "",
                gender: 1,
                civility: 1,
                firstname: "Admin",
                lastname: "Get-skills",
                adress1: "place de l'église",
                adress2: "",
                zipcode: "02000",
                city: "URCEL",
                country_id: 76,
                nativeCountry_id: 76,
                birthday: new Date(),
                nationality_id: 76,
                firstlanguage_id: 76,
                systemRole_id: 5
            });
            console.log(_colors.red("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"));
            console.log(_colors.red("!!!!!!! CREATION DE L'UTILISATEUR 'admin'. Modifiez le mot de passe par default !!!!!!!"));
            console.log(_colors.red("!!!!!!!              identifiant: 'admin'   mot de passe: 'admin'               !!!!!!!"));
            console.log(_colors.red("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"));
            console.log(_colors.green("OK"));
        }
        /**
         * 
         * DEV MODE ONLY : AJOUT DU SET DE DONNEES
         * 
         */

        if(isDev) {
            console.log("");
            console.log('\x1b[36m%s\x1b[0m',"## Ajout du jeu de données test ....");
            /**
             * FILL TABLE 'csv_items'
             */                             
            const barItemCsv =progressBar('#Ajout des items CSV......................... ', itemsCsv.length);
            const listItemsCsv = [];
            for (const item of itemsCsv) {
                listItemsCsv.push({
                    csvItem_id : item.csvItem_id,
                    field: item.field,
                    label: item.label,
                    inLine: item.inLine,
                    test_id: item.test_id
                });
                barItemCsv.increment();
            }
            barItemCsv.stop();
            await models['csvItem'].bulkCreate(listItemsCsv);
            console.log(_colors.green("OK"));
            /**
             * FILL TABLE 'instituts' 
             */                              
            const barInstituts =progressBar('#Ajout des instituts......................... ', instituts.length);
            const institutList = [];
            for (const institut of instituts) {
                institutList.push({
                    label: institut.label,
                    adress1: institut.adress1,
                    adress2: institut.adress2,
                    zipcode: institut.zipcode,
                    city: institut.city,
                    country_id: institut.country_id,
                    email: institut.email,
                    siteweb: institut.siteweb,
                    phone: institut.phone,
                    socialNetwork: institut.socialNetwork,
                    stripeId: institut.stripeId
                });
                barInstituts.increment();
            }
            barInstituts.stop();
            await models['Institut'].bulkCreate(institutList);
            console.log(_colors.green("OK"));
            
            /**
             * FILL TABLE 'users' utilisateur  test 'fixe' pour les MDP
             */
            const nbRandomUsers = 100;   
            const barUsers =progressBar('#Ajout des utilisateurs...................... ', users.length + nbRandomUsers);
            const usersList = [];
            // Ajout des utilisateurs fixe pour les tests
            for (const user of users) {
                usersList.push({
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
                    nativeCountry_id: user.country_id,
                    birthday: user.birthday,
                    nationality_id: user.nationality_id,
                    firstlanguage_id: user.firstlanguage_id,
                    systemRole_id: user.systemRole_id
                });
                barUsers.increment();
            }

            /**
             * FILL TABLE 'users' utilisateur  test 'fixe' pour les MDP
             */
            // Ajouts des utisateurs aléatoires
            
            for (let index = 1; index <= nbRandomUsers; index++) {
                usersList.push({
                    login: "user"+index, 
                    password: await bcrypt.hash('123', 2),
                    email: faker.internet.email(),
                    phone: faker.phone.phoneNumber(),
                    gender: faker.datatype.number({
                        'min': 1,
                        'max': 2
                    }),
                    civility: faker.datatype.number({
                        'min': 1,
                        'max': 2
                    }),
                    firstname: faker.name.firstName(),
                    lastname: faker.name.lastName(),
                    adress1: faker.address.streetAddress(),
                    adress2: faker.address.secondaryAddress(),
                    zipcode: faker.address.zipCode(),
                    city: faker.address.city(),
                    country_id: faker.datatype.number({
                        'min': 1,
                        'max': countries.length
                    }),
                    nativeCountry_id: faker.datatype.number({
                        'min': 1,
                        'max': countries.length
                    }),
                    birthday: faker.date.between('1950-01-01', '2002-12-31'),
                    nationality_id: faker.datatype.number({
                        'min': 1,
                        'max': countries.length
                    }),
                    firstlanguage_id: faker.datatype.number({
                        'min': 1,
                        'max': languages.length
                    }),
                    systemRole_id: 1
                }); 
                barUsers.increment();
            }
            barUsers.stop();
            await models['User'].bulkCreate(usersList);
            console.log(_colors.green("OK"));
            /**
             * FILL TABLE 'institutHasUser'
             */
            const nbrRandomInstitutHasUser = nbRandomUsers + 20;
            let nbrDoublons = 0;                    
            const barInstitutsHasUsers =progressBar('#Ajout des utilisateurs dans les instituts... ', nbrRandomInstitutHasUser + 5);
            const institutHasUserList = [
                { 'user_id': 1, 'institut_id': 2, 'role_id': 1 },
                { 'user_id': 1, 'institut_id': 1, 'role_id': 1 },
                { 'user_id': 2, 'institut_id': 1, 'role_id': 4 },
                { 'user_id': 3, 'institut_id': 2, 'role_id': 1 },
                { 'user_id': 4, 'institut_id': 2, 'role_id': 2 }
            ];
            barInstitutsHasUsers.update(5);
            for (let index = 0; index < nbrRandomInstitutHasUser; index++) {
                const obj = {
                    'user_id': faker.datatype.number({
                        'min': 5,
                        'max': nbRandomUsers
                    }), 
                    'institut_id': faker.datatype.number({
                        'min': 1,
                        'max': instituts.length
                    }), 
                    'role_id': faker.datatype.number({
                        'min': 1,
                        'max': 4
                    })
                }
                const result = institutHasUserList.find( ({ user_id , institut_id}) => user_id === obj.user_id && institut_id == obj.institut_id );
                if(!result) {
                    institutHasUserList.push(obj);
                    barInstitutsHasUsers.increment();  
                } else {
                    nbrDoublons++;
                }
                    
            }
            barInstitutsHasUsers.stop();
            await models['institutHasUser'].bulkCreate(institutHasUserList);
            if(nbrDoublons != 0 ) {
                console.log(_colors.red("Attention : "+nbrDoublons + " doublons n'ont pas été ajoutés dans la base de données."));
            }
            else {
                console.log(_colors.green("OK"));
            }
            /**
             * FILL TABLE 'sessions'
             */
            const nbSession = 10;
            const barSessions =progressBar('#Ajout des sessions.......................... ', nbSession);
            const listSession = [];
            for (let index = 0; index < nbSession; index++) {
                const dateStart = faker.date.future();
                const dateEnd = faker.date.future(1,dateStart);
                const dateLimite = faker.date.past(1,dateStart);
                const testId = faker.datatype.number({
                    'min': 1,
                    'max': 5
                });
                let levelId= null;
                switch(testId) {
                    case 1 :
                        levelId= faker.datatype.number({
                            'min': 1,
                            'max': 5
                        });
                    break;
                    case 2 :
                        levelId= faker.datatype.number({
                            'min': 13,
                            'max': 14
                        });
                    break;
                    case 3 :
                        levelId= faker.datatype.number({
                            'min': 6,
                            'max': 10
                        });
                    break;
                    case 4 :
                        levelId= null
                    break;
                    case 5 :
                        levelId= faker.datatype.number({
                            'min': 11,
                            'max': 12
                        });
                    break;
                }
                listSession.push({
                    session_id:index+1, 
                    institut_id: faker.datatype.number({
                        'min': 1,
                        'max': instituts.length
                    }),
                    start: dateStart,
                    end: dateEnd,
                    limitDateSubscribe:dateLimite,
                    placeAvailable: faker.datatype.number({
                        'min': 1,
                        'max': 100
                    }),
                    validation: faker.datatype.number({
                        'min': 0,
                        'max': 1
                    }),
                    test_id: testId,
                    level_id: levelId
                });
                barSessions.increment();
            }
            barSessions.stop();
            await models['Session'].bulkCreate(listSession);
            console.log(_colors.green("OK"));
            /**
            * FILL TABLE 'sessionUsers'
            */
            const nbSessionUsers = 300;           
            const barSessionUsers =progressBar('#Ajout des utilisateurs dans les sessions.... ', nbSessionUsers);

            const listSessionsUsers = [];
            let sessionUser_id = 1;
            const addUserInstitut = [];
            for (let index = 0; index < nbSessionUsers; index++) {
                // On selectionne un numéro de session
                const sessionId = faker.datatype.number({
                    'min': 1,
                    'max': nbSession
                });
                
                // On récupére l'institut ID de cette session
            const {institut_id, placeAvailable} = listSession.find(({session_id}) => session_id == sessionId);
            // On récupére un identifiant d'utilisateur
            const userId = faker.datatype.number({
                    'min': 1,
                    'max': users.length + nbRandomUsers - 1
                });
                // On vérifie la session de soit pas complete.
                
                // on verifie que l'utilisateur n'est pas déjà inscris dans la session
                const isSubscribed = listSessionsUsers.find(({user_id, session_id}) => user_id === userId && session_id === sessionId);
                const sessionUsers = listSessionsUsers.filter(({session_id}) => session_id === sessionId);
                const isSessionFull = sessionUsers.length === placeAvailable ? true : false;
            // On vérifie que l'utilisateur est membre de l'institut
            isInstitutMember = institutHasUserList.find( ({ user_id , institut_id}) => user_id === userId && institut_id === institut_id );          
            // Si l'utilisateur est membre de l'institut, alors on l'ajoute dans la session de l'utilisateur
            if( isInstitutMember && !isSessionFull && !isSubscribed ) {
                    listSessionsUsers.push({
                        sessionUser_id : sessionUser_id,
                        session_id: sessionId,
                        user_id: userId,
                        paymentMode: 1,
                        numInscrAnt: null,
                        hasPaid: faker.datatype.number({
                            'min': 0,
                            'max': 1
                        }),
                        informations: faker.lorem.sentence()
                    });
                    sessionUser_id++;
                    barSessionUsers.increment();
            }    
            }
            barSessionUsers.stop();
            await models['sessionUser'].bulkCreate(listSessionsUsers);
            const doublons = nbSessionUsers - listSessionsUsers.length;
            console.log(_colors.red("Attention : "+ doublons + " doublons n'ont pas été ajoutés dans la base de données."));
            console.log(_colors.green("OK"));

            /**
            * FILL TABLE 'sessionUsers'
            */
        const listSkills = [];
        
        const nbrSkills = 20;
        const nbrSubSkills = 20;
        const nbrSubSubSkills = 20;
        const barSkill =progressBar('#Ajout des compétences....................... ', nbrSkills +nbrSubSkills +nbrSubSubSkills);
        let skillId = 1;
        for (skillId; skillId < nbrSkills+1 ; skillId++) {
                listSkills.push({
                    skill_id: skillId,
                    label: "Compétence " + skillId,
                    parent_id: null,
                    isArchive: false,
                });
                barSkill.increment();
            }
            let subSkillID = 0;
            for (let index = 1; index < nbrSubSkills+1 ; index++) {
                subSkillID = skillId + index - 1;
                listSkills.push({
                    skill_id: subSkillID,
                    label: "Sous-Compétence " + index,
                    parent_id: faker.datatype.number({
                        'min': 1,
                        'max': nbrSkills
                    }),
                    isArchive: false,
                });
                barSkill.increment();
            }
            let subSubSkillID = 0;
            for (let index = 1; index < nbrSubSubSkills+1 ; index++) {
                subSubSkillID = subSkillID + index;
                listSkills.push({
                    skill_id: subSubSkillID,
                    label: "Sous-Sous-Compétence " + index,
                    parent_id: faker.datatype.number({
                        'min': nbrSkills+1,
                        'max': nbrSkills + nbrSubSubSkills
                    }),
                    isArchive: false,
                });
                barSkill.increment();
            }
            barSkill.stop();
            await models['Skill'].bulkCreate(listSkills);
            console.log(_colors.green("OK"));
            /**
            * FILL TABLE 'exam'
            */
            // Nombre d'Exam dans la base
           const nbrExam = 50;
            const nbrTest = testList.length;
            const listExam = [];
            let examId = 1;
            const barExam =progressBar('#Ajout des épreuves.......................... ', nbrExam);
            for (examId; examId < nbrExam + 1 ; examId++) 
            {
                // on selectionne ensuite un test aleatoirement
                const testId = faker.datatype.number({
                    'min': 1,
                    'max': nbrTest
                });
                // On récupére la liste des niveaux du test
            
            
                const listLevelTest =  levelList.filter(({test_id}) => test_id === testId )
                // parmis cette liste , on choisit aléatoirement un identifiant 
                let levelId = null;
                if(listLevelTest.length > 0 ) {
                    levelId = listLevelTest[faker.datatype.number({
                        'min': 0,
                        'max': listLevelTest.length-1
                    })].level_id;
                }
                listExam.push({
                    exam_id: examId,
                    test_id: testId,
                    level_id: levelId,
                    label: "Epreuve N°" + examId,
                    isWritten: faker.datatype.number({
                        'min': 0,
                        'max': 1
                    }),
                    isOption: faker.datatype.number({
                        'min': 0,
                        'max': 1
                    }),
                    price: faker.datatype.number({
                        'min': 10,
                        'max': 800
                    }),
                    coeff: faker.datatype.number({
                        'min': 1,
                        'max': 3
                    }),
                    nbrQuestions: faker.datatype.number({
                        'min': 1,
                        'max': 20
                    }),
                    duration: faker.datatype.number({
                        'min': 10,
                        'max': 3600
                    }),
                    successScore: faker.datatype.number({
                        'min': 100,
                        'max': 500
                    })
                });
                barExam.increment();
            }
            barExam.stop();
            await models['Exam'].bulkCreate(listExam);
            console.log(_colors.green("OK"));
            /**
            * FILL TABLE 'sessionHasExam'
            */                                   
        
            const barSessionHasExam =progressBar('#Ajout des détails des épreuves par sessions. ', listSession.length );
            const listsessionHasExam = [];
            let sessionHasExamId = 1;
                for(const session of listSession) {
                    // On récupére la liste des épreuves de la session ( definit par le niveau et le test)
                    const sessionExams = listExam.filter(({test_id, level_id}) => test_id === session.test_id && level_id === session.level_id);
                    for(const exam of sessionExams) {
                        listsessionHasExam.push({
                            sessionHasExam_id : sessionHasExamId,
                            adressExam: faker.address.streetAddress() + " " + faker.address.zipCode() + " " + faker.address.city(),
                            DateTime: faker.date.future(),
                            session_id: session.session_id,
                            exam_id: exam.exam_id,
                            room: "Room " +  faker.datatype.number({
                                'min': 1,
                                'max': 20
                            }),
                        });
                        sessionHasExamId++;
                    }
                    barSessionHasExam.increment();
                }
                barSessionHasExam.stop();
                await models['sessionHasExam'].bulkCreate(listsessionHasExam);
                console.log(_colors.green("OK"));
        
            /**
            * FILL TABLE 'empowermentTests'
            */ 
            //On récupére la liste des instituts.
            const listEmpowerment = [];
            let empowermentId = 1;
            const barEmpowerment =progressBar('#Droit des enseignants des instituts......... ', instituts.length );
            for(const institut of instituts) {
                const institutId = institut.institut_id;
                //On récupére les utilisateurs de l'institut qui ont un rôle d'enseignant
                const listTeachersInstitut = institutHasUserList.filter(({institut_id,role_id}) => institut_id===institutId && role_id >=2);           
                for(const teacher of listTeachersInstitut) {
                    listEmpowerment.push({
                        empowermentTest_id: empowermentId,
                        code: faker.random.alphaNumeric(6).toUpperCase(),
                        institut_id: institutId,
                        user_id: teacher.user_id,
                        test_id:faker.datatype.number({
                            'min': 1,
                            'max': tests.length
                        })
                    });
                    empowermentId++;
                }
                barEmpowerment.increment();
            }
            await models['empowermentTests'].bulkCreate(listEmpowerment);
            barEmpowerment.stop();
            console.log(_colors.green("OK"));
            /**
            * FILL TABLE 'sessionExamHasExaminator'
            */ 
            // On récupére la liste des utilisateurs inscrits aux sessions
            const listExamExaminator = [];
            let sessionExamHasExaminator_id = 1;          
            const barEmpowermentExaminator =progressBar('#Assignation des examinateurs................ ', listSessionsUsers.length );
            
            for(const sessionHasUser of listSessionsUsers) {
                const sessionHasExam = listsessionHasExam.filter(({session_id}) => session_id === sessionHasUser.session_id);
                const session = listSession.find(({session_id}) => session_id === sessionHasUser.session_id);
                const empowerment_test = listEmpowerment.filter(({institut_id, test_id}) => institut_id===session.institut_id && test_id===session.test_id);
                
                for(const sessionExam of sessionHasExam) {
                    const isExist = listExamExaminator.find(({sessionHasExam_id,sessionUser_id}) => sessionHasExam_id===sessionExam.sessionHasExam_id && sessionUser_id === sessionHasUser.sessionUser_id);
                    
                    if(!isExist) {
                    let empowermentTestId = faker.datatype.number({
                            'min': 0,
                            'max': empowerment_test.length
                        });
                        if(empowermentTestId===0) empowermentTestId = null;

                        listExamExaminator.push({
                            sessionExamHasExaminator_id: sessionExamHasExaminator_id,
                            sessionHasExam_id: sessionExam.sessionHasExam_id,
                            sessionUser_id: sessionHasUser.sessionUser_id,
                            empowermentTest_id: empowermentTestId
                        });
                        sessionExamHasExaminator_id++;
                    }
                }
                barEmpowermentExaminator.increment();
            }
            barEmpowermentExaminator.stop();
            await models['sessionExamHasExaminator'].bulkCreate(listExamExaminator);
            console.log(_colors.green("OK"));
            /**
            * FILL TABLE 'Institut_has_prices'
            */ 
            const nbrInstitutExamPrices = 50;
            const listInstitutExamPrice = [];            
            const barExamPrices =progressBar('#Ajout des prix des épreuves ................ ', nbrInstitutExamPrices );
            for (let index = 1; index <= nbrInstitutExamPrices ; index++) {
                const institutId = faker.datatype.number({
                    'min': 1,
                    'max': instituts.length
                });
                const examId = faker.datatype.number({
                    'min': 1,
                    'max': listExam.length
                });
                const isExist = listInstitutExamPrice.find(({institut_id,exam_id }) => institut_id===institutId && exam_id === examId);
                if(!isExist) {
                    listInstitutExamPrice.push({
                        price_id:index,
                        institut_id: institutId,
                        exam_id: examId,
                        price:faker.datatype.number({
                            'min': 200,
                            'max': 1000
                        }),
                        tva:22  
                    });  
                }     
                barExamPrices.increment();    
            }
            barExamPrices.stop();
            await models['InstitutHasPrices'].bulkCreate(listInstitutExamPrice);
            console.log(_colors.green("OK"));
            /**
            * FILL TABLE 'sessionUserOption'
            */ 

            const listSessionUserOption = []; 
            const barUserOption =progressBar('#Ajout des options des utilisateurs.......... ', listSessionsUsers.length );
            for(const sessionUser of listSessionsUsers) {
                const sessionUserId = sessionUser.sessionUser_id;
                const listExamBySessionId = listsessionHasExam.filter(({session_id}) => session_id === sessionUser.session_id);

                for(const ExamSession of listExamBySessionId) {
                    let tva = null;
                    let userPrice = faker.datatype.number({
                        'min': 0,
                        'max': 3
                    });
                    if(userPrice < 3) {
                        userPrice = null;
                    }
                    else {
                        userPrice = faker.datatype.number({
                            'min': 200,
                            'max': 1000
                        });
                        tva = faker.datatype.number({
                            'min': 10,
                            'max': 22
                        });
                    }
                    if(!listSessionUserOption.find(({exam_id,sessionUser_id}) => sessionUser_id === sessionUserId && exam_id ===ExamSession.exam_id)) {
                        const adress = faker.address.streetAddress() + " " +  faker.address.zipCode() + " " + faker.address.city();
                        const isCandidate  = !listExam.find(({exam_id}) => exam_id === ExamSession.exam_id).isOption;
                        listSessionUserOption.push({
                            exam_id: ExamSession.exam_id,
                            user_price: userPrice,
                            addressExam: adress,
                            tva: tva,
                            DateTime: faker.date.future(),
                            isCandidate: isCandidate,
                            sessionUser_id: sessionUserId
                        });
                    }
                }
                barUserOption.increment();
            }
            barUserOption.stop();
            await models['sessionUserOption'].bulkCreate(listSessionUserOption);
            console.log(_colors.green("OK"));

            // Suppression des Templates
            await destroyFolder('templates');
            createRepositoryWithName('templates');
        }

        console.log("");
        console.log("");
        console.log(_colors.green("API en écoute ..."));
    } catch (error) {
        throw error;
    }
}

module.exports = {initDB, models}