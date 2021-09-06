const {models} = require("../../models");
module.exports = (app) => {
    app.get('/api/instituts/:institut_id/sessions/:session_id/find_all', async (req, res) => {

        const institutId = req.params.institut_id;
        const sessionId = req.params.session_id;
        const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

        try {
            const result = await getAllFieldsForSchoolDocuments(institutId, sessionId, userId);

            if (result === {})
                return res.status(400).json({message: 'no result found', data: {}})

            return res.status(200).json({message: "route ok", data: new FieldsForDocuments(result, userId)});
        } catch (e) {
            return res.status(400).json({message: e.message, data: {}})
        }

    });

    const PAYMENTS = {
        1: {
            payment_id: 1,
            label: 'Carte Bancaire'
        },
        2: {
            payment_id: 2,
            label: 'PayPal'
        },
        3: {
            payment_id: 3,
            label: 'Virement bancaire'
        },
        4: {
            payment_id: 4,
            label: 'Chèque'
        }
    };

    const GENDERS = {
        1: {
            civility_id: 1,
            label: 'Mr.'
        },
        2: {
            civility_id: 2,
            label: 'Mme.'
        }
    };

    const ALIAS = {
        institut: {
            label: 'SCHOOL_NAME',
            adress1: 'SCHOOL_ADDRESS1',
            adress2: 'SCHOOL_ADDRESS2',
            fullAdress: 'SCHOOL_ADRESS_FULL',
            fullInlineAdress: 'SCHOOL_ADRESS_FULL_INLINE',
            zipcode: 'SCHOOL_ZIPCODE',
            city: 'SCHOOL_CITY',
            phone: 'SCHOOL_PHONE',
            email: 'SCHOOL_EMAIL',
            country: 'SCHOOL_COUNTRY',
            footLabel: 'SCHOOL_NAME_FOOT',
            footAdress1: 'SCHOOL_ADDRESS1_FOOT',
            footAdress2: 'SCHOOL_ADDRESS2_FOOT',
            footFullAdress: 'SCHOOL_ADRESS_FULL',
            footFullInlineAdress: 'SCHOOL_ADRESS_FULL_INLINE',
            footZipcode: 'SCHOOL_ZIPCODE_FOOT',
            footCity: 'SCHOOL_CITY_FOOT',
            footPhone: 'SCHOOL_PHONE_FOOT',
            footEmail: 'SCHOOL_EMAIL_FOOT',
            footCountry: 'SCHOOL_COUNTRY_FOOT',
        },
        expeditor: {
            label: 'EXPEDITOR_NAME',
            adress1: 'EXPEDITOR_ADDRESS1',
            adress2: 'EXPEDITOR_ADDRESS2',
            fullAdress: 'EXPEDITOR_ADRESS_FULL',
            fullInlineAdress: 'EXPEDITOR_ADRESS_FULL_INLINE',
            zipcode: 'EXPEDITOR_ZIPCODE',
            city: 'EXPEDITOR_CITY',
            phone: 'EXPEDITOR_PHONE',
            email: 'EXPEDITOR_EMAIL',
            country: 'EXPEDITOR_COUNTRY',
            footLabel: 'EXPEDITOR_NAME_FOOT',
            footAdress1: 'EXPEDITOR_ADDRESS1_FOOT',
            footAdress2: 'EXPEDITOR_ADDRESS2_FOOT',
            footFullAdress: 'EXPEDITOR_ADRESS_FULL',
            footFullInlineAdress: 'EXPEDITOR_ADRESS_FULL_INLINE',
            footZipcode: 'EXPEDITOR_ZIPCODE_FOOT',
            footCity: 'EXPEDITOR_CITY_FOOT',
            footPhone: 'EXPEDITOR_PHONE_FOOT',
            footEmail: 'EXPEDITOR_EMAIL_FOOT',
            footCountry: 'EXPEDITOR_COUNTRY_FOOT'
        },
        receiver: {
            label: 'RECEIVER_NAME',
            gender: 'RECEIVER_GENDER',
            firstname: 'RECEIVER_FIRSTNAME',
            lastname: 'RECEIVER_LASTNAME',
            adress1: 'RECEIVER_ADDRESS1',
            adress2: 'RECEIVER_ADDRESS2',
            fullAdress: 'RECEIVER_ADRESS_FULL',
            fullInlineAdress: 'RECEIVER_ADRESS_FULL_INLINE',
            zipcode: 'RECEIVER_ZIPCODE',
            city: 'RECEIVER_CITY',
            country: 'RECEIVER_COUNTRY',
            phone: 'RECEIVER_PHONE',
            email: 'RECEIVER_EMAIL',
        },
        candidat: {
            gender: 'USER_GENDER',
            firstname: 'USER_FIRSTNAME',
            lastname: 'USER_LASTNAME',
            adress1: 'USER_ADDRESS1',
            adress2: 'USER_ADDRESS2',
            fullAdress: 'USER_ADRESS_FULL',
            fullInlineAdress: 'USER_ADRESS_FULL_INLINE',
            zipcode: 'USER_ZIPCODE',
            city: 'USER_CITY',
            country: 'USER_COUNTRY',
            phone: 'USER_PHONE',
            email: 'USER_EMAIL',
            language: 'USER_LANGUAGE',
            nationality: 'USER_NATIONALITY',
            birthday: 'USER_BIRTHDAY',
            numInscrip: 'USER_NUM_INSCR',
            payment: 'PAIEMENT_INSCRIPTION'
        },
        sessions: {
            start: 'SESSION_START_DATE',
            hour: 'SESSION_START_HOUR',
            test: 'TEST',
            level: 'LEVEL',
        },
        exams: {
            label: 'EXAM',
            address: 'EXAM_ADDRESS',
            room: 'EXAM_LOCATION',
            start: 'EXAM_START_DATE',
            hour: 'EXAM_START_HOUR',
        }

    }

    const GETSKILLS = {
        label: 'Get-Skills',
        adress1: '10 rue de l\'Eglise',
        adress2: '',
        zipcode: '02000',
        city: 'URCEL',
        phone: '0123456789',
        email: 'getskills@getskills.com',
        country: 'France'
    }

    function FieldsForDocuments (datas, userId, school = true) {

        const sessionUser = datas.sessionUsers.filter((sessionUser) => sessionUser.user_id === userId)[0];

        // school
        this[ALIAS.institut.label] = datas.Institut.label;
        this[ALIAS.institut.adress1] = datas.Institut.adress1;
        this[ALIAS.institut.adress2] = datas.Institut.adress2;
        this[ALIAS.institut.zipcode] = datas.Institut.zipcode;
        this[ALIAS.institut.city] = datas.Institut.city;
        this[ALIAS.institut.fullAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2);
        this[ALIAS.institut.fullInlineAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2, true);
        this[ALIAS.institut.phone] = datas.Institut.phone;
        this[ALIAS.institut.email] = datas.Institut.email;
        this[ALIAS.institut.country] = datas.Institut.institutCountry.label;

        this[ALIAS.institut.footLabel] = datas.Institut.label;
        this[ALIAS.institut.footAdress1] = datas.Institut.adress1;
        this[ALIAS.institut.footAdress2] = datas.Institut.adress2;
        this[ALIAS.institut.footZipcode] = datas.Institut.zipcode;
        this[ALIAS.institut.footCity] = datas.Institut.city;
        this[ALIAS.institut.footFullAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2);
        this[ALIAS.institut.footFullInlineAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2, true);
        this[ALIAS.institut.footPhone] = datas.Institut.phone;
        this[ALIAS.institut.footEmail] = datas.Institut.email;
        this[ALIAS.institut.footCountry] = datas.Institut.institutCountry.label;


        // expeditor
        this[ALIAS.expeditor.label] = school ? datas.Institut.label : GETSKILLS.label;
        this[ALIAS.expeditor.adress1] = school ? datas.Institut.adress1 : GETSKILLS.adress1;
        this[ALIAS.expeditor.adress2] = school ? datas.Institut.adress2 : GETSKILLS.adress2;
        this[ALIAS.expeditor.zipcode] = school ? datas.Institut.zipcode : GETSKILLS.zipcode;
        this[ALIAS.expeditor.city] = school ? datas.Institut.city : GETSKILLS.city;
        this[ALIAS.expeditor.phone] = school ? datas.Institut.phone : GETSKILLS.phone;
        this[ALIAS.expeditor.email] = school ? datas.Institut.email : GETSKILLS.email;
        this[ALIAS.expeditor.country] = school ? datas.Institut.institutCountry.label : GETSKILLS.country;
        this[ALIAS.expeditor.fullAdress] =
            school
                ? formaterAdress(datas.Institut.adress1, datas.Institut.adress2)
                : formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2)
        this[ALIAS.expeditor.fullInlineAdress] =
            school
                ? formaterAdress(datas.Institut.adress1, datas.Institut.adress2, true)
                : formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2, true)

        this[ALIAS.expeditor.footLabel] = school ? datas.Institut.label : GETSKILLS.label;
        this[ALIAS.expeditor.footAdress1] = school ? datas.Institut.adress1 : GETSKILLS.adress1;
        this[ALIAS.expeditor.footAdress2] = school ? datas.Institut.adress2 : GETSKILLS.adress2;
        this[ALIAS.expeditor.footZipcode] = school ? datas.Institut.zipcode : GETSKILLS.zipcode;
        this[ALIAS.expeditor.footCity] = school ? datas.Institut.city : GETSKILLS.city;
        this[ALIAS.expeditor.footPhone] = school ? datas.Institut.phone : GETSKILLS.phone;
        this[ALIAS.expeditor.footEmail] = school ? datas.Institut.email : GETSKILLS.email;
        this[ALIAS.expeditor.footCountry] = school ? datas.Institut.institutCountry.label : GETSKILLS.country;

        this[ALIAS.expeditor.footFullAdress] =
            school
                ? formaterAdress(datas.Institut.adress1, datas.Institut.adress2)
                : formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2)
        this[ALIAS.expeditor.footFullInlineAdress] =
            school
                ? formaterAdress(datas.Institut.adress1, datas.Institut.adress2)
                : formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2)


        // receiver
        this[ALIAS.receiver.label] = school ? '' : datas.Institut.label;
        this[ALIAS.receiver.gender] = school ? GENDERS[sessionUser.User.gender].label : '';
        this[ALIAS.receiver.firstname] = school ? sessionUser.User.firstname : '';
        this[ALIAS.receiver.lastname] = school ? sessionUser.User.lastname : '';
        this[ALIAS.receiver.adress1] = school ? sessionUser.User.adress1 : datas.Institut.adress1;
        this[ALIAS.receiver.adress2] = school ? sessionUser.User.adress2 : datas.Institut.adress2;
        this[ALIAS.receiver.zipcode] = school ? sessionUser.User.zipcode : datas.Institut.zipcode;
        this[ALIAS.receiver.city] = school ? sessionUser.User.city : datas.Institut.city;
        this[ALIAS.receiver.fullAdress] =
            school
                ? formaterAdress(sessionUser.User.adress1, sessionUser.User.adress2)
                : formaterAdress(datas.Institut.adress1, datas.Institut.adress2)
        this[ALIAS.receiver.fullInlineAdress] =
            school
                ? formaterAdress(sessionUser.User.adress1, sessionUser.User.adress2, true)
                : formaterAdress(datas.Institut.adress1, datas.Institut.adress2, true)
        this[ALIAS.receiver.country] = school ? sessionUser.User.country.label : datas.Institut.institutCountry.label;

        // user
        this[ALIAS.candidat.gender] = GENDERS[sessionUser.User.gender].label;
        this[ALIAS.candidat.firstname] = sessionUser.User.firstname;
        this[ALIAS.candidat.lastname] = sessionUser.User.lastname;
        this[ALIAS.candidat.adress1] = sessionUser.User.adress1;
        this[ALIAS.candidat.adress2] = sessionUser.User.adress2;
        this[ALIAS.candidat.zipcode] = sessionUser.User.zipcode;
        this[ALIAS.candidat.city] = sessionUser.User.city;
        this[ALIAS.candidat.fullAdress] = formaterAdress(sessionUser.User.adress1, sessionUser.User.adress2);
        this[ALIAS.candidat.fullInlineAdress] = formaterAdress(sessionUser.User.adress1, sessionUser.User.adress2, true);
        this[ALIAS.candidat.phone] = sessionUser.User.phone;
        this[ALIAS.candidat.email] = sessionUser.User.email;
        this[ALIAS.candidat.country] = sessionUser.User.country.label;
        this[ALIAS.candidat.language] = sessionUser.User.firstlanguage.label;
        this[ALIAS.candidat.nationality] = sessionUser.User.nationality.label;
        this[ALIAS.candidat.birthday] = Math.ceil(Math.abs((new Date(sessionUser.User.birthday)) - (new Date('1899-12-31'))) / (1000 * 60 * 60 * 24));
        this[ALIAS.candidat.payment] = sessionUser.paymentMode;
        this[ALIAS.candidat.numInscrip] = new Date(sessionUser.inscription).getFullYear().toString() + new Date(sessionUser.inscription).getMonth().toString().padStart(2, "0") + sessionUser.sessionUser_id.toString().padStart(6, "0");

        // exams
        this[ALIAS.sessions.test] = datas.Test.label;
        this[ALIAS.sessions.level] = datas.Level ? datas.Level.level : '';
        this[ALIAS.sessions.start] = formaterDate(datas.start);
        this[ALIAS.sessions.hour] = formaterHour(datas.start);

        sessionUser.sessionUserOptions.forEach((suo, index) => {
            this[ALIAS.exams.label + '_' + (++index)] = suo.exam.label;
            this[ALIAS.exams.address + '_' + (++index)] = (suo.addressExam) ? suo.exam.sessionHasExams.adressExam : suo.addressExam;
            this[ALIAS.exams.room + '_' + (++index)] = suo.exam.sessionHasExams.room ? suo.exam.sessionHasExams.room : '';
            this[ALIAS.exams.start + '_' + (++index)] = suo.DateTime ? formaterDate(suo.DateTime) : formaterDate(suo.exam.sessionHasExams.DateTime);
            this[ALIAS.exams.hour + '_' + (++index)] = suo.DateTime ? formaterHour(suo.DateTime) : formaterHour(suo.exam.sessionHasExams.DateTime);
        })



        function formaterAdress (adress1, adress2, inline = false) {
            if (inline) return adress2 ? adress1 + " - " + adress2 : adress1
            if (!inline) return adress2 ? adress1 + "\n" + adress2 : adress1
        }

        function formaterDate (myDate) {
            return Math.ceil(Math.abs((new Date(myDate)) - (new Date('1899-12-31'))) / (1000 * 60 * 60 * 24));
        }

        function formaterHour (myHour) {
            return (myHour.getHours() + (myHour.getMinutes() / 60)) / 24 ;
        }

    }

    async function getAllFieldsForSchoolDocuments (institutId, sessionId, userId) {

        return await models['Session'].findOne({
            where: {session_id: sessionId},
            include: [
                {
                    model: models['Test'],
                },
                {
                    model: models['Level'],
                    required: false,
                },
                {
                    model: models['Institut'],
                    include:
                        [
                            {
                                attributes: [['label', 'label']],
                                model: models['Country'],
                                as: 'institutCountry'
                            },
                        ]
                },
                {
                    model: models['sessionUser'],
                    include:
                        [
                            {
                                model: models['User'],
                                where: userId ? {user_id: userId} : {},
                                attributes: {exclude: ['password']},
                                include:
                                    [
                                        {
                                            attributes: [['name', 'label']],
                                            model: models['Language'],
                                            as: 'firstlanguage'
                                        },
                                        {
                                            attributes: [['label', 'label']],
                                            model: models['Country'],
                                            as: 'country'
                                        },
                                        {
                                            attributes: [['countryNationality', 'label']],
                                            model: models['Country'],
                                            as: 'nationality'
                                        }
                                    ]
                            },
                            {
                                model: models['sessionUserOption'],
                                where: {isCandidate: true},
                                include:
                                    [
                                        {
                                            model: models['Exam'],
                                            include:
                                                [
                                                    {
                                                        model: models['InstitutHasPrices'],
                                                        required: false,
                                                        where: {institut_id: institutId},
                                                    },
                                                    {
                                                        model: models['sessionHasExam'],
                                                        where: {session_id: sessionId}
                                                    }
                                                ]
                                        }
                                    ]
                            }
                        ]
                },
            ]
        })
    }
}