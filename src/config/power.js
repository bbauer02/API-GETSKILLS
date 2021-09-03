module.exports = (env) => ({
    GET: {
        instituts: {
            default: env.INSTITUTS_GET,
            users: {
                default: env.INSTITUTS_USERS_GET,
                email: {
                    default: env.INSTITUTS_USERS_MAIL_GET
                }
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
                    default: env.SESSIONS_USER_GET
                },
                orders: {
                    default: env.INVOICES_GET
                },
                documents: {
                    default: env.DOCUMENTS_GET,
                }
            },
            invoices: {
                default: env.INVOICES_GET,
                download: env.INVOICES_GET,
            },
            documents: {
                default: env.DOCUMENTS_GET,
                filetypes: env.DOCUMENTS_GET,
                download: env.DOCUMENTS_GET,
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
        tests: env.TESTS_GET,
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
                users: env.INSTITUTS_NEW_USER_POST
            },
            invoices: {
                default: env.INVOICES_POST,
            }
        },
        exams: env.EXAMS_POST,
        countries: env.COUNTRIES_POST,
        levels: env.LEVELS_POST,
        roles: env.ROLES_POST,
        sessions: env.SESSIONS_POST,
        tests: env.TESTS_POST,
        users: env.USERS_POST,
        skills: {
            default: env.SKILLS_POST
        },
        documents: {
            default: env.DOCUMENTS_POST,
            upload: env.DOCUMENTS_POST
        },
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
                users: env.SESSIONS_USER_DELETE
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
        tests: env.TESTS_DELETE,
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