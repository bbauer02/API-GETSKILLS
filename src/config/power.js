module.exports = (env) => ({
    GET : {
        instituts : {
           default: env.INSTITUTS_GET,
           users : env.INSTITUTS_USERS_GET
        },
        exams     : env.EXAMS_GET,
        countries : env.COUNTRIES_GET,
        levels    : env.LEVELS_GET,
        roles     : env.ROLES_GET,
        sessions  : env.SESSIONS_GET,
        tests     : env.TESTS_GET,
        users     : env.USERS_GET,
        options   : env.OPTIONS_GET
    },
    POST : {
        instituts : {
            default : env.INSTITUTS_POST,
            users : env.INSTITUTS_USERS_POST
        },
        exams     : env.EXAMS_POST,
        countries : env.COUNTRIES_POST,
        levels    : env.LEVELS_POST,
        roles     : env.ROLES_POST,
        sessions  : env.SESSIONS_POST,
        tests     : env.TESTS_POST,
        users     : env.USERS_POST,
    },
    PUT : {
        instituts : env.INSTITUTS_PUT,
        exams     : env.EXAMS_PUT,
        countries : env.COUNTRIES_PUT,
        levels    : env.LEVELS_PUT,
        roles     : env.ROLES_PUT,
        sessions  : {
            default: env.SESSIONS_PUT,
            admin: env.SESSIONS_PUT_ADMIN,
        },
        tests     : env.TESTS_PUT,
        users     : env.USERS_PUT,
        options   : env.OPTIONS_PUT
    },
    DELETE : {
        instituts :{
            default: env.INSTITUTS_DELETE
        },
        exams     : env.EXAMS_DELETE,
        countries : env.COUNTRIES_DELETE,
        levels    : env.LEVELS_DELETE,
        roles     : env.ROLES_DELETE,
        sessions  : env.SESSIONS_DELETE,
        tests     : env.TESTS_DELETE,
        users     : env.USERS_DELETE,
    }
  });