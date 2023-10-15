const fs = require('fs');
const path = require('path');
const DataTypes = require('sequelize');
const bcrypt = require('bcrypt');
const filebasename = path.basename(__filename);
var faker = require('faker');
// On charge les jeux de données JSON Standards
const countries = require('../db/mock-countries');
const languages = require('../db/mock-languages');
const roles = require('../db/mock-roles');
const levels = require('../db/mock-levels');
const tests = require('../db/mock-tests');
const users = require('../db/mock-users');
const instituts = require('../db/mock-instituts');
const itemsCsv = require('../db/mock-items_csv');
 class MockDatas {

    // Params
    nbrUsers;
    nbrSessions;
    nbrSessionUsers;
    nbrSkills;
    nbrSubSkills;
    nbrSubSubSkills;
    nbrExams;
    nbrInstitutExamPrices;
    // Datas
    countries = [];
    languages = [];
    roles = [];
    tests = [];
    levels=[];
    defaultAdminProd = {};
    itemsCsv = [];
    instituts = [];
    defaultUsers = [];
    randomUsers = [];
    institutHasDefaultUsers = [];
    institutHasRandomUsers = [];
    sessions = [];
    sessionHasUsers = [];
    skills = [];
    exams = [];
    sessionHasExams = [];
    empowerments = [];
    sessionExamsExaminators = [];
    institutHasPrices = [];
    sessionUserOption = [];

    constructor(
                 nbrUsers=500, 
                nbrSession=50, 
                nbrSessionUsers = 1000, 
                nbrSkills=20, 
                nbrSubSkills=20, 
                nbrSubSubSkills=20,
                nbrExams=50,
                nbrInstitutExamPrices = 50) {
        this.nbrUsers = nbrUsers;
        this.nbrSessions = nbrSession;
        this.nbrSessionUsers = nbrSessionUsers;
        this.nbrSkills = nbrSkills;
        this.nbrSubSkills = nbrSubSkills;
        this.nbrSubSubSkills = nbrSubSubSkills;
        this.nbrExams = nbrExams;
        this.nbrInstitutExamPrices = nbrInstitutExamPrices;
    }
    async initialize() {
        this.#fillCountries();
        this.#fillLanguages();
        this.#fillRoles();
        this.#fillTests();
        this.#fillLevels();
        this.#fillItemsCSV();
        this.#fillInstituts();
        this.#createDefaultAdminProd();
        await this.#fillDefaultUsers();
        await this.#fillRandomUsers();
        this.#fillInstitutHasDefaultUsers();
        this.#fillInstitutHasRandomUsers();
        this.#fillSessions();
        this.#fillSessionsHasUsers();
        this.#fillSkills();
        this.#fillExams();
        this.#fillSessionHasExams();
        this.#fillEmpowerments();
        this.#fillSessionExamExaminators();
        this.#fillInstitutHasPrices();
       // this.#fillSessionUserOption();
    }

    #fillCountries() {
        for (const country of countries) {
            this.countries.push({
                label: country.en_short_name,
                countryNationality: country.nationality,
                countryLanguage: country.nationality,
                code: country.alpha_2_code
            });
        }
    }
    #fillLanguages() {
        for (const language of languages) {
            this.languages.push({
                nativeName: language.nativeName,
                name: language.name
            });
        }
    }
    #fillRoles() {
        for (const role of roles) {
            this.roles.push({
                label: role.label,
                power: role.power
            });
        }
    }
    #fillTests() {
        let testid = 1;
            for (const test of tests) {
                this.tests.push({
                    test_id : testid,
                    label: test.label,
                    isInternal: test.isInternal,
                    parent_id: test.parent_id
                });
                testid++;
            }
    }
    #fillLevels() {
        let levelId=1;
        for (const level of levels) {
            this.levels.push({
                level_id: levelId,
                label: level.label,
                ref: level.ref,
                description: level.description,
                test_id: level.test_id
            });
            levelId++;
        }
    }
   async #createDefaultAdminProd() {
        this.defaultAdminProd = {
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
        }
    }
    #fillItemsCSV() {
        for (const item of itemsCsv) {
            this.itemsCsv.push({
                csvItem_id : item.csvItem_id,
                field: item.field,
                label: item.label,
                inLine: item.inLine,
                test_id: item.test_id
            });
        }
    }
    #fillInstituts() {
        for (const institut of instituts) {
            this.instituts.push({
                institut_id : institut.institut_id,
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
                stripeId: institut.stripeId,
                stripeActivated: institut.stripeActivated
            });
        }
    }
    async #fillDefaultUsers() {
        for (const user of users) {
            this.defaultUsers.push({
                user_id: user.user_id,
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
        }
    }
    async #fillRandomUsers(){
        for (let index = 1; index <= this.nbrUsers; index++) {
            this.randomUsers.push({
                user_id: this.defaultUsers.length + index,
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
        }
    }
    #fillInstitutHasDefaultUsers() {
        this.institutHasDefaultUsers = [
            { 'user_id': 1, 'institut_id': 2, 'role_id': 1 },
            { 'user_id': 1, 'institut_id': 1, 'role_id': 1 },
            { 'user_id': 2, 'institut_id': 1, 'role_id': 4 },
            { 'user_id': 3, 'institut_id': 2, 'role_id': 1 },
            { 'user_id': 4, 'institut_id': 2, 'role_id': 2 }
        ]
    }   
    #fillInstitutHasRandomUsers() {
        for (let index = 1; index <= this.nbrUsers; index++) {
            const obj = {
                'user_id': this.defaultUsers.length + index, 
                'institut_id': faker.datatype.number({
                    'min': 1,
                    'max': instituts.length
                }), 
                'role_id': faker.datatype.number({
                    'min': 1,
                    'max': 4
                })
            }
            this.institutHasRandomUsers.push(obj);
        }
    }
    #fillSessions() {
        for (let index = 1; index < this.nbrSessions; index++) {
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
            this.sessions.push({
                session_id:index, 
                institut_id: faker.datatype.number({
                    'min': 1,
                    'max': this.instituts.length
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
        }
    }
    #fillSessionsHasUsers() {
        for (let index = 1; index <= this.nbrSessionUsers; index++) {
            // On selectionne un Id de session aléatoirement
            // On récupère son institut et le nombre de place disponible.
            const currentSession = faker.random.arrayElement(this.sessions);
            const {institut_id, placeAvailable, session_id} = currentSession;
            // On récupére aléatoirement un identifiant de USER membre de l'institut
            const ranUser_id = faker.random.arrayElement(this.institutHasRandomUsers.filter(RandomUser => RandomUser.institut_id === institut_id)).user_id;
            // On vérifie que l'utilisateur ne soit pas déjà inscrit dans la session
            const isSubscribed = this.sessionHasUsers.find(({user_id, session_id}) => user_id === ranUser_id && session_id === session_id);
            // On vérifie que la session est pleine
            const isSessionFull = this.sessionHasUsers.length === placeAvailable ? true : false;
            if(!isSessionFull && isSubscribed === undefined) {
                this.sessionHasUsers.push({
                    sessionUser_id : index,
                    session_id,
                    user_id: ranUser_id,
                    paymentMode: 1,
                    numInscrAnt: null,
                    hasPaid: faker.datatype.number({
                        'min': 0,
                        'max': 1
                    }),
                    informations: faker.lorem.sentence()
                });
            }
        }
    }
    #fillSkills() {
        let skillId = 1
        for (skillId; skillId <= this.nbrSkills; skillId++) {   
            this.skills.push({
                skill_id: skillId,
                label: "Compétence " + skillId,
                parent_id: null,
                isArchive: false,
            });
        }
        skillId--;
        let subSkillId = 1;
        for (subSkillId; subSkillId <= this.nbrSubSkills; subSkillId++) {   
            this.skills.push({
                skill_id: skillId + subSkillId,
                label: "SousCompétence " + subSkillId,
                parent_id: faker.datatype.number({
                    'min': 1,
                    'max': skillId
                }),
                isArchive: false,
            });
        }
        subSkillId--;
        let subSubSkillId = 1
        for (subSubSkillId; subSubSkillId <= this.nbrSubSubSkills; subSubSkillId++) {   
            this.skills.push({
                skill_id: skillId+subSkillId+subSubSkillId,
                label: "SousSousCompétence " + subSubSkillId,
                parent_id: faker.datatype.number({
                    'min': skillId + 1,
                    'max': subSkillId
                }),
                isArchive: false,
            });
        }
    }
    #fillExams() {
        for (let examId = 1;examId <= this.nbrExams;examId++) {
            // On sélectionne un test aléatoirement
            const randomTest = faker.random.arrayElement(this.tests);
            // On récupére la liste des niveaux du test
            const listLevelTest = this.levels.filter(({test_id}) => test_id === randomTest.test_id );
            // On choisit aléatoirement un niveau de cette liste
            const randomLevel = faker.random.arrayElement(listLevelTest);
            this.exams.push({
                exam_id: examId,
                test_id: randomTest? randomTest.test_id : null,
                level_id: randomLevel? randomLevel.level_id : null,
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
        }
    }
    #fillSessionHasExams() {
        let sessionHasExamId = 1;
        for(const session of this.sessions) {
            // On récupére la liste des épreuves de la session ( definit par le niveau et le test de la session)
            const sessionExams = this.exams.filter(({test_id, level_id}) => test_id === session.test_id && level_id === session.level_id);
            for(const exam of sessionExams) {
                this.sessionHasExams.push({
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
        }
    }
    #fillEmpowerments() {
        let empowermentId = 1;
        for(const institut of this.instituts) {
            //On récupére les utilisateurs de l'institut qui ont un rôle d'enseignant
            const teachers = this.institutHasRandomUsers.filter(({institut_id,role_id}) => institut_id===institut.institut_id && role_id >=2); 
            for(const teacher of teachers) {
                this.empowerments.push({
                    empowermentTest_id: empowermentId,
                    code: faker.random.alphaNumeric(6).toUpperCase(),
                    institut_id: institut.institut_id,
                    user_id: teacher.user_id,
                    test_id:faker.datatype.number({
                        'min': 1,
                        'max': this.tests.length
                    })
                });
                empowermentId++;
            }
        }
    }
    #fillSessionExamExaminators() {
        let sessionExamHasExaminator_id = 1;
        // On récupére la liste des utilisateurs des sessions
        for(const sessionUser of this.sessionHasUsers) {
            const sessionExams = this.sessionHasExams.filter(({session_id}) => session_id === sessionUser.session_id);
            const session = this.sessions.find(({session_id}) => session_id === sessionUser.session_id);
            const empowerment_test = this.empowerments.filter(({institut_id, test_id}) => institut_id===session.institut_id && test_id===session.test_id);
            for(const sessionExam of sessionExams) {
                const isExist = this.sessionExamsExaminators.find(({sessionHasExam_id,sessionUser_id}) => sessionHasExam_id===sessionExam.sessionHasExam_id && sessionUser_id === sessionUser.sessionUser_id);
                if(!isExist) {
                    let empowermentTestId = faker.datatype.number({
                        'min': 0,
                        'max': empowerment_test.length
                    });
                    if(empowermentTestId===0) empowermentTestId = null;
                    this.sessionExamsExaminators.push({
                        sessionExamHasExaminator_id: sessionExamHasExaminator_id,
                        sessionHasExam_id: sessionExam.sessionHasExam_id,
                        sessionUser_id: sessionUser.sessionUser_id,
                        empowermentTest_id: empowermentTestId
                    });
                    sessionExamHasExaminator_id++;
                } 
            }
        }
    }
    #fillInstitutHasPrices() {
        for (let index = 1; index <= this.nbrInstitutExamPrices ; index++) {
            const institut = faker.random.arrayElement(this.instituts);
            const exam = faker.random.arrayElement(this.exams);
            const isExist = this.institutHasPrices.find(({institut_id,exam_id }) => institut_id===institut.institut_id && exam_id === exam.exam_id);
            if(!isExist) {
                this.institutHasPrices.push({
                    price_id:index,
                    institut_id: institut.institut_id,
                    exam_id: exam.exam_id,
                    price:faker.datatype.number({
                        'min': 200,
                        'max': 1000
                    }),
                    tva:22  
                });
            }
        }
    }
    #fillSessionUserOption() {
        for(const sessionUser of this.sessionHasUsers) {
            const sessionExams = this.sessionHasExams.filter(({session_id}) => session_id === sessionUser.session_id);
            for(const ExamSession of sessionExams) {
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
                if(!this.sessionUserOption.find(({exam_id,sessionUser_id}) => sessionUser_id === sessionUser.session_id && exam_id ===ExamSession.exam_id)) {
                    const adress = faker.address.streetAddress() + " " +  faker.address.zipCode() + " " + faker.address.city();
                    const isCandidate  = !this.exams.find(({exam_id}) => exam_id === ExamSession.exam_id).isOption;
                    this.sessionUserOption.push({
                        exam_id: ExamSession.exam_id,
                        user_price: userPrice,
                        addressExam: adress,
                        tva: tva,
                        DateTime: faker.date.future(),
                        isCandidate: isCandidate,
                        sessionUser_id: sessionUser.sessionUser_id
                    });
                }
            }
        }
    }
}

module.exports = {
    MockDatas
};