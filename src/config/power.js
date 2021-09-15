module.exports = (env) => ({
    GET: {
        instituts: {
            default: env.INSTITUTS_GET,
            users: {
                default: env.INSTITUTS_USERS_GET,
                email: {
                    default: env.INSTITUTS_USERS_MAIL_GET
                },
                empowermentTests: env.INSTITUTS_EXAMINATORS_GET
            },
            docs: env.SKILLS_GET,
            exams: {
                price: env.INSTITUTS_EXAMS_PRICE_GET
            },
            empowermenttests: env.EMPOWERMENT_GET,
            sessionshist: env.INSTITUTS_SESSION_HIST_GET,
            sessions: {
                default: env.SESSION_GET,
                users: {
                    default: env.SESSIONS_USER_GET,
                    exams: env.SESSIONS_EXAM_GET
                },
                exams: env.SESSIONS_EXAM_GET,
                orders: env.INVOICES_GET,
                documents: {
                    default: env.DOCUMENTS_GET,
                    download: env.DOCUMENTS_GET,
                },
                exports: env.SESSIONS_EXPORT
            },
            documents: {
                default: env.DOCUMENTS_GET,
                download: env.DOCUMENTS_GET,
            },
            invoices: {
                default: env.INVOICES_GET,
                download: env.INVOICES_GET,
            },
            sessionexams: {
                default: env.SESSIONS_EXAM_GET,
                sessionexamexaminators: env.SESSIONS_EXAM_EXAMINATOR_GET
            }
        },
        exams: {
            default: env.EXAMS_GET
        },
        countries: env.COUNTRIES_GET,
        levels: env.LEVELS_GET,
        roles: {
            default: env.ROLES_GET
        },
        sessions: env.SESSIONS_GET,
        tests: {
            default: env.TESTS_GET,
            csvitems: {
                default: env.TESTS_CSV_GET,
                fields: env.TESTS_CSV_GET,
            },
        },
        users: {
            default: env.USERS_GET
        },
        options: env.OPTIONS_GET,
        skills: {
            default: env.SKILLS_GET
        },
        invoices: {
            default: env.INVOICES_GET,
            download: env.INVOICES_GET,
        },
        documents: {
            default: env.DOCUMENTS_GET,
        }
    },
    POST: {
        instituts: {
            default: env.INSTITUTS_POST,
            users: env.INSTITUTS_USERS_POST,
            documents: {
                default: env.DOCUMENTS_POST,
                upload: env.DOCUMENTS_POST
            },
            exams: {
                price: env.INSTITUTS_EXAMS_PRICE_POST
            },
            empowermenttests: env.EMPOWERMENT_POST,
            newuser: env.INSTITUTS_NEW_USER_POST,
            sessions: {
                default: env.SESSIONS_POST,
                users: env.INSTITUTS_NEW_USER_POST,
                exams: env.SESSIONS_EXAM_POST,
                exports: env.SESSIONS_EXPORT
            },
            invoices: {
                default: env.INVOICES_POST,
            },
            sessionexams: {
                default: env.SESSIONS_EXAM_POST,
                sessionexamexaminators: env.SESSIONS_EXAM_EXAMINATOR_POST
            }
        },
        exams: env.EXAMS_POST,
        countries: env.COUNTRIES_POST,
        levels: env.LEVELS_POST,
        roles: env.ROLES_POST,
        sessions: env.SESSIONS_POST,
        tests: {
            default: env.TESTS_POST,
            csvitems: env.TESTS_CSV_POST
        },
        users: env.USERS_POST,
        skills: {
            default: env.SKILLS_POST
        },
        documents: {
            default: env.DOCUMENTS_POST,
            upload: env.DOCUMENTS_POST
        }
    },
    PUT: {
        instituts: {
            default: env.INSTITUTS_PUT,
            exams: {
                price: env.INSTITUTS_EXAMS_PRICE_PUT
            },
            empowermenttests: {
                default: env.EMPOWERMENT_PUT
            },
            users: {
                default: env.INSTITUTS_USERS_PUT
            },
            sessions: {
                default: env.SESSIONS_PUT,
                admin: {
                    default: env.SESSIONS_ADMIN_PUT
                },
                exams: env.SESSIONS_EXAM_PUT,
                users: env.SESSIONS_USER_OPTION_PUT
            },
            sessionexams: {
                default: env.SESSIONS_EXAM_PUT,
                sessionexamexaminators: env.SESSIONS_EXAM_EXAMINATOR_PUT
            },
            sessionUsers: {
                default: env.SESSIONS_USER_OPTION_PUT,
                exams: {
                    default: env.SESSIONS_USER_OPTION_PUT,
                    options: env.SESSIONS_USER_OPTION_PUT,
                }
            },
        invoices: {
            default: env.INVOICES_PUT,
        }
        },
        exams: env.EXAMS_PUT,
        countries: env.COUNTRIES_PUT,
        levels: env.LEVELS_PUT,
        roles: env.ROLES_PUT,
        sessions: env.SESSIONS_PUT,
        tests: env.TESTS_PUT,
        users: env.USERS_PUT,
        options: env.OPTIONS_PUT,
        skills: {
            default: env.SKILLS_PUT
        },
        invoices: {
            default: env.INVOICES_PUT,
        }
    },
    DELETE: {
        instituts: {
            default: env.INSTITUTS_DELETE,
            docs: env.DOCS_DELETE,
            exams: {
                price: env.INSTITUTS_EXAMS_PRICE_DELETE
            },
            users: env.INSTITUTS_USERS_DELETE,
            empowermenttests: env.EMPOWERMENT_DELETE,
            sessions: {
                default: env.SESSIONS_DELETE,
                users: env.SESSIONS_USER_DELETE,
                exams: env.SESSIONS_EXAM_DELETE
            },
            sessionexams: {
                default: env.SESSIONS_EXAM_DELETE,
                sessionexamexaminators: env.SESSIONS_EXAM_EXAMINATOR_DELETE
            },
            documents: {
                default: env.DOCUMENTS_DELETE
            }
        },
        exams: env.EXAMS_DELETE,
        countries: env.COUNTRIES_DELETE,
        levels: env.LEVELS_DELETE,
        roles: env.ROLES_DELETE,
        sessions: env.SESSIONS_DELETE,
        tests: {
            default: env.TESTS_DELETE,
            csvitems: env.TESTS_CSV_DELETE
        },
        users: env.USERS_DELETE,
        skills: {
            default: env.SKILLS_DELETE
        },
        invoices: {
            default: env.INVOICES_PUT,
        },
        documents: {
            default: env.DOCUMENTS_DELETE
        }
    }
});