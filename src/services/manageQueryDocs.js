const {models} = require("../models");

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
        fullAdress: 'EXPEDITOR_ADDRESS_FULL',
        fullInlineAdress: 'EXPEDITOR_ADDRESS_FULL_INLINE',
        zipcode: 'EXPEDITOR_ZIPCODE',
        city: 'EXPEDITOR_CITY',
        phone: 'EXPEDITOR_PHONE',
        email: 'EXPEDITOR_EMAIL',
        country: 'EXPEDITOR_COUNTRY',
        footLabel: 'EXPEDITOR_NAME_FOOT',
        footAdress1: 'EXPEDITOR_ADDRESS1_FOOT',
        footAdress2: 'EXPEDITOR_ADDRESS2_FOOT',
        footFullAdress: 'EXPEDITOR_ADDRESS_FULL_FOOT',
        footFullInlineAdress: 'EXPEDITOR_ADDRESS_FULL_INLINE_FOOT',
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
        fullAdress: 'RECEIVER_ADDRESS_FULL',
        fullInlineAdress: 'RECEIVER_ADDRESS_FULL_INLINE',
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
        adress1: 'USER_ADRESS1',
        adress2: 'USER_ADRESS2',
        fullAdress: 'USER_ADRESS_FULL',
        fullInlineAdress: 'USER_ADRESS_FULL_INLINE',
        zipcode: 'USER_ZIPCODE',
        city: 'USER_CITY',
        country: 'USER_COUNTRY',
        phone: 'USER_PHONE',
        email: 'USER_MAIL',
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
        nb: 'NB_EXAMS',
    },
    invoice: {
        labels: 'DESCRIPTIONS',
        quantities: 'QUANTITES',
        articles_pu: 'ARTICLES_PU',
        articles_tva: 'ARTICLES_TVA',
        articles_ht: 'ARTICLES_HT',
        articles_ttc: 'ARTICLES_TTC',
        total_ht: 'TOTAL_HT',
        total_tva: 'TOTAL_TVA',
        total_ttc: 'TOTAL_TTC',
        tvas: 'LIST_TVA',
        total_ht_par_tva: 'LIST_HT',
        total_ttc_par_tva: 'LIST_TTC',
        date_invoice: 'DATE_FACTURE',
        reference: 'REFERENCE',
        numero: 'NUM_INVOICE',
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

/**
 * Retourne toutes les données pour les documents de Getskills
 * @param institutId
 * @param sessionId
 * @returns {Promise<*[]>}
 */
async function getAllFieldsForGetSkillsDocuments (institutId, sessionId) {

    const result = await getAllFields(institutId, sessionId);

    let fields = [];

    if (result === {})
        return fields;

    fields.push(new FieldsForDocuments(result));

    return fields;
}

/**
 * Retourne toutes les données pour la session recherchée.
 * Si userid != null, recherche toutes les données pour la session et l'utilisateur souhaités.
 * @param institutId
 * @param sessionId
 * @param userId
 * @returns {Promise<*[]>}
 */
async function getAllFieldsForSchoolDocuments (institutId, sessionId, userId = null) {

    const result = await getAllFields(institutId, sessionId, userId);

    let fields = [];

    if (result.length === 0)
        return fields;

    if (userId) {
        fields.push(new FieldsForDocuments(result, userId, true))

    } else {

        const users = result.sessionUsers.reduce((prev, curr) => {
            prev.push(curr.user_id);
            return prev
        }, [])

        users.forEach((user) => {
            fields.push(new FieldsForDocuments(result, user, true));
        })
    }

    return fields;
}

/**
 * Un objet contenant tous les champs des documents
 * Générer les champs pour les  d'une école pour 1 candidat :           userId >= 0
 * @param datas
 * @param userId
 * @constructor
 */
function FieldsForDocuments (datas, userId) {

    const sessionUser = datas.sessionUsers.filter((su) => su.user_id === userId)[0];


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
    this[ALIAS.expeditor.label] = datas.Institut.label;
    this[ALIAS.expeditor.adress1] = datas.Institut.adress1;
    this[ALIAS.expeditor.adress2] = datas.Institut.adress2;
    this[ALIAS.expeditor.zipcode] = datas.Institut.zipcode;
    this[ALIAS.expeditor.city] = datas.Institut.city;
    this[ALIAS.expeditor.phone] = datas.Institut.phone;
    this[ALIAS.expeditor.email] = datas.Institut.email;
    this[ALIAS.expeditor.country] = datas.Institut.institutCountry.label;
    this[ALIAS.expeditor.fullAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2);
    this[ALIAS.expeditor.fullInlineAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2, true);

    this[ALIAS.expeditor.footLabel] = datas.Institut.label;
    this[ALIAS.expeditor.footAdress1] = datas.Institut.adress1;
    this[ALIAS.expeditor.footAdress2] = datas.Institut.adress2;
    this[ALIAS.expeditor.footZipcode] = datas.Institut.zipcode;
    this[ALIAS.expeditor.footCity] = datas.Institut.city;
    this[ALIAS.expeditor.footPhone] = datas.Institut.phone;
    this[ALIAS.expeditor.footEmail] = datas.Institut.email;
    this[ALIAS.expeditor.footCountry] = datas.Institut.institutCountry.label;

    this[ALIAS.expeditor.footFullAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2);
    this[ALIAS.expeditor.footFullInlineAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2);

    // receiver
    this[ALIAS.receiver.label] = '';
    this[ALIAS.receiver.gender] = GENDERS[sessionUser.User.gender].label;
    this[ALIAS.receiver.firstname] = sessionUser.User.firstname;
    this[ALIAS.receiver.lastname] = sessionUser.User.lastname;
    this[ALIAS.receiver.adress1] = sessionUser.User.adress1;
    this[ALIAS.receiver.adress2] = sessionUser.User.adress2;
    this[ALIAS.receiver.zipcode] = sessionUser.User.zipcode;
    this[ALIAS.receiver.city] = sessionUser.User.city;
    this[ALIAS.receiver.fullAdress] = formaterAdress(sessionUser.User.adress1, sessionUser.User.adress2);
    this[ALIAS.receiver.fullInlineAdress] = formaterAdress(sessionUser.User.adress1, sessionUser.User.adress2, true);
    this[ALIAS.receiver.country] = sessionUser.User.country.label;
    this[ALIAS.receiver.email] = sessionUser.User.email;
    this[ALIAS.receiver.phone] = sessionUser.User.phone;

    // exams
    this[ALIAS.sessions.test] = datas.Test.label;
    this[ALIAS.sessions.level] = datas.Level.label ? datas.Level.label : '';
    this[ALIAS.sessions.start] = formaterDate(datas.start);
    this[ALIAS.sessions.hour] = formaterHour(datas.start);

    // user

    if (sessionUser) {
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
        this[ALIAS.candidat.language] = sessionUser.User.firstlanguage.name;
        this[ALIAS.candidat.nationality] = sessionUser.User.nationality.label;
        this[ALIAS.candidat.birthday] = Math.ceil(Math.abs((new Date(sessionUser.User.birthday)) - (new Date('1899-12-31'))) / (1000 * 60 * 60 * 24));
        this[ALIAS.candidat.payment] = PAYMENTS[sessionUser.paymentMode].label;
        this[ALIAS.candidat.numInscrip] = new Date(sessionUser.inscription).getFullYear().toString() + new Date(sessionUser.inscription).getMonth().toString().padStart(2, "0") + sessionUser.sessionUser_id.toString().padStart(6, "0");

        this[ALIAS.exams.nb] = 0;
        sessionUser.sessionUserOptions.forEach((suo, index) => {

            this[ALIAS.exams.nb] += 1;
            this[ALIAS.exams.label + '_' + (index + 1)] = suo.Exam.label;
            this[ALIAS.exams.address + '_' + (index + 1)] = (suo.addressExam) ? suo.Exam.sessionHasExams[0].adressExam : suo.addressExam;
            this[ALIAS.exams.room + '_' + (index + 1)] = suo.Exam.sessionHasExams[0].room ? suo.Exam.sessionHasExams[0].room : '';
            this[ALIAS.exams.start + '_' + (index + 1)] = suo.DateTime ? formaterDate(suo.DateTime) : formaterDate(suo.Exam.sessionHasExams[0].DateTime);
            this[ALIAS.exams.hour + '_' + (index + 1)] = suo.DateTime ? formaterHour(suo.DateTime) : formaterHour(suo.Exam.sessionHasExams[0].DateTime);

        })

        // invoices
        this[ALIAS.invoice.numero] = new Date(sessionUser.inscription).getFullYear().toString() + new Date(sessionUser.inscription).getMonth().toString().padStart(2, "0") + sessionUser.sessionUser_id.toString().padStart(6, "0");
        this[ALIAS.invoice.reference] = new Date(sessionUser.inscription).getFullYear().toString() + new Date(sessionUser.inscription).getMonth().toString().padStart(2, "0") + datas.Test.label + '-' + sessionUser.sessionUser_id.toString().padStart(6, "0");
        this[ALIAS.invoice.date_invoice] = formaterDate(new Date());

        let lines = generateLinesInvoiceSchoolsForItsCandidats(sessionUser);

        // invoices : school VERS candidats
        const LinesForInvoices = new LinesForInvoice(lines);
        const myTableVat = new TableVat(lines);

        this[ALIAS.invoice.labels] = LinesForInvoices[ALIAS.invoice.labels];
        this[ALIAS.invoice.quantities] = LinesForInvoices[ALIAS.invoice.quantities];
        this[ALIAS.invoice.articles_pu] = LinesForInvoices[ALIAS.invoice.articles_pu];
        this[ALIAS.invoice.articles_tva] = LinesForInvoices[ALIAS.invoice.articles_tva];
        this[ALIAS.invoice.articles_ht] = LinesForInvoices[ALIAS.invoice.articles_ht];
        this[ALIAS.invoice.articles_ttc] = LinesForInvoices[ALIAS.invoice.articles_ttc];
        this[ALIAS.invoice.total_ht] = LinesForInvoices[ALIAS.invoice.total_ht];
        this[ALIAS.invoice.total_ttc] = LinesForInvoices[ALIAS.invoice.total_ttc];
        this[ALIAS.invoice.total_tva] = LinesForInvoices[ALIAS.invoice.total_tva];

        this[ALIAS.invoice.tvas] = myTableVat[ALIAS.invoice.tvas];
        this[ALIAS.invoice.total_ht_par_tva] = myTableVat[ALIAS.invoice.total_ht_par_tva];
        this[ALIAS.invoice.total_ttc_par_tva] = myTableVat[ALIAS.invoice.total_ttc_par_tva];
    }
}


/**
 * Créer les lignes pour la commande au client
 * @param sessionUser
 * @returns {T[]}
 */
function generateLinesInvoiceSchoolsForItsCandidats (sessionUser) {
    return sessionUser.sessionUserOptions.reduce((prev, curr, index) => {
        prev.push({
            label: curr.Exam.label,
            price_pu_ttc: curr.user_price ? curr.user_price : curr.Exam.InstitutHasPrices[0].price,
            tva: curr.tva ? curr.tva : curr.Exam.InstitutHasPrices[0].tva,
            quantity: 1,
        });
        return prev;
    }, [])
}


/**
 * Créer les lignes pour la commande au client
 * @param datas
 * @returns {T[]}
 */
function generateLinesInvoiceGetSkillsForItsClients (datas) {
    // invoices : getskills VERS schools

    let concatLines = [];

    datas.sessionUsers.forEach((su) => {
        concatLines = concatLines.concat(su.sessionUserOptions);
    })

    const lines = concatLines.reduce((prev, curr, index) => {

        const line = prev.filter(item => item.examId === curr.Exam.exam_id);

        if (line.length === 0) {
            prev.push({
                examId: curr.Exam.exam_id,
                label: curr.Exam.label,
                price_pu_ttc: curr.user_price ? curr.user_price : curr.Exam.InstitutHasPrices[0].price,
                tva: curr.tva ? curr.tva : curr.Exam.InstitutHasPrices[0].tva,
                quantity: 1,
            });
            return prev
        } else {
            line[0].quantity += 1;
        }
        return prev
    }, [])

    return lines.reduce((prev, curr) => {
        prev.push({
            label: curr.label, price_pu_ttc: curr.price_pu_ttc, tva: curr.tva, quantity: curr.quantity
        })
        return prev;
    }, []);

}

/**
 * Créer des
 * @param datas
 * @constructor
 */
function FieldsForInvoice (datas) {

    // expeditor
    this[ALIAS.expeditor.label] = GETSKILLS.label;
    this[ALIAS.expeditor.adress1] = GETSKILLS.adress1;
    this[ALIAS.expeditor.adress2] = GETSKILLS.adress2;
    this[ALIAS.expeditor.zipcode] = GETSKILLS.zipcode;
    this[ALIAS.expeditor.city] = GETSKILLS.city;
    this[ALIAS.expeditor.phone] = GETSKILLS.phone;
    this[ALIAS.expeditor.email] = GETSKILLS.email;
    this[ALIAS.expeditor.country] = GETSKILLS.country;
    this[ALIAS.expeditor.fullAdress] = formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2);
    this[ALIAS.expeditor.fullInlineAdress] = formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2, true);

    this[ALIAS.expeditor.footLabel] = GETSKILLS.label;
    this[ALIAS.expeditor.footAdress1] = GETSKILLS.adress1;
    this[ALIAS.expeditor.footAdress2] = GETSKILLS.adress2;
    this[ALIAS.expeditor.footZipcode] = GETSKILLS.zipcode;
    this[ALIAS.expeditor.footCity] = GETSKILLS.city;
    this[ALIAS.expeditor.footPhone] = GETSKILLS.phone;
    this[ALIAS.expeditor.footEmail] = GETSKILLS.email;
    this[ALIAS.expeditor.footCountry] = GETSKILLS.country;

    this[ALIAS.expeditor.footFullAdress] = formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2);
    this[ALIAS.expeditor.footFullInlineAdress] = formaterAdress(GETSKILLS.adress1, GETSKILLS.adress2, true);

    // receiver
    this[ALIAS.receiver.label] = datas.Institut.label;
    this[ALIAS.receiver.gender] = '';
    this[ALIAS.receiver.firstname] = '';
    this[ALIAS.receiver.lastname] = '';
    this[ALIAS.receiver.adress1] = datas.Institut.adress1;
    this[ALIAS.receiver.adress2] = datas.Institut.adress2;
    this[ALIAS.receiver.zipcode] = datas.Institut.zipcode;
    this[ALIAS.receiver.city] = datas.Institut.city;
    this[ALIAS.receiver.fullAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2);
    this[ALIAS.receiver.fullInlineAdress] = formaterAdress(datas.Institut.adress1, datas.Institut.adress2, true);
    this[ALIAS.receiver.country] = datas.Institut.institutCountry.label;
    this[ALIAS.receiver.email] = datas.Institut.email;
    this[ALIAS.receiver.phone] = datas.Institut.phone;


    // invoices

    this[ALIAS.invoice.numero] = datas.reference + "-" + datas.invoice_id.toString().padStart(6, "0");
    this[ALIAS.invoice.reference] = datas.ref_client;
    this[ALIAS.invoice.date_invoice] = formaterDate(datas.createdAt);
    this[ALIAS.invoice.total_ttc] = datas.price_total_TTC;
    this[ALIAS.sessions.start] = formaterDate(datas.DateTime);
    this[ALIAS.candidat.payment] = '-';

    // invoices : school VERS candidats
    const LinesForInvoices = new LinesForInvoice(datas.lines);
    const myTableVat = new TableVat(datas.lines);

    this[ALIAS.invoice.labels] = LinesForInvoices[ALIAS.invoice.labels];
    this[ALIAS.invoice.quantities] = LinesForInvoices[ALIAS.invoice.quantities];
    this[ALIAS.invoice.articles_pu] = LinesForInvoices[ALIAS.invoice.articles_pu];
    this[ALIAS.invoice.articles_tva] = LinesForInvoices[ALIAS.invoice.articles_tva];
    this[ALIAS.invoice.articles_ht] = LinesForInvoices[ALIAS.invoice.articles_ht];
    this[ALIAS.invoice.articles_ttc] = LinesForInvoices[ALIAS.invoice.articles_ttc];
    this[ALIAS.invoice.total_ht] = LinesForInvoices[ALIAS.invoice.total_ht];
    this[ALIAS.invoice.total_ttc] = LinesForInvoices[ALIAS.invoice.total_ttc];
    this[ALIAS.invoice.total_tva] = LinesForInvoices[ALIAS.invoice.total_tva];

    this[ALIAS.invoice.tvas] = myTableVat[ALIAS.invoice.tvas];
    this[ALIAS.invoice.total_ht_par_tva] = myTableVat[ALIAS.invoice.total_ht_par_tva];
    this[ALIAS.invoice.total_ttc_par_tva] = myTableVat[ALIAS.invoice.total_ttc_par_tva];

}


/**
 * Requete pour obtenir tous les champs pour la génération des documents.
 * Obtiens toutes les données d'une session.
 * Si user != null, obtient toutes les données de la session souhaitée pour le user souhaité.
 * @param institutId
 * @param sessionId
 * @param userId
 * @returns {Promise<*>}
 */
async function getAllFields (institutId, sessionId, userId = null) {

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
                                        attributes: [['name', 'name']],
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

// méthodes

function LinesForInvoice (lines) {

    this[ALIAS.invoice.labels] = "";
    this[ALIAS.invoice.quantities] = "";
    this[ALIAS.invoice.articles_pu] = "";
    this[ALIAS.invoice.articles_tva] = "";
    this[ALIAS.invoice.articles_ht] = '';
    this[ALIAS.invoice.articles_ttc] = '';
    this[ALIAS.invoice.total_ht] = 0;
    this[ALIAS.invoice.total_ttc] = 0;
    this[ALIAS.invoice.total_tva] = 0;


    lines.forEach(line => {
        let carriage = manageCarriage(line.label);
        this[ALIAS.invoice.labels] += line.label + "\n";
        this[ALIAS.invoice.quantities] += line.quantity + carriage;
        this[ALIAS.invoice.articles_pu] += line.price_pu_ttc + carriage;
        this[ALIAS.invoice.articles_tva] += line.tva + carriage;
        this[ALIAS.invoice.articles_ht] += calculer_HT(line.quantity, line.price_pu_ttc, line.tva).toFixed(2) + carriage;
        this[ALIAS.invoice.articles_ttc] += calculer_TTC(line.quantity, line.price_pu_ttc).toFixed(2) + carriage;
        this[ALIAS.invoice.total_ht] += calculer_HT(line.quantity, line.price_pu_ttc, line.tva);
        this[ALIAS.invoice.total_ttc] += calculer_TTC(line.quantity, line.price_pu_ttc);
        this[ALIAS.invoice.total_tva] += calculer_TVA(line.quantity, line.price_pu_ttc, line.tva);
    })
}

function TableVat (lines) {

    this[ALIAS.invoice.tvas] = '';
    this[ALIAS.invoice.total_ht_par_tva] = '';
    this[ALIAS.invoice.total_ttc_par_tva] = '';

    const listTva = lines.reduce((prev, curr) => {
        if (!prev.includes(curr.tva)) {
            prev.push(curr.tva);
        }
        return prev;
    }, []);

    this[ALIAS.invoice.tvas] = listTva.reduce((prev, curr) => {
        return prev + curr + "\n";
    }, '');

    listTva.forEach((tva) => {
        this[ALIAS.invoice.total_ht_par_tva] += lines
                .filter((line) => line.tva === tva)
                .reduce((prev, curr) => {
                    return prev + calculer_HT(curr.quantity, curr.price_pu_ttc, curr.tva)
                }, 0)
                .toFixed(2)
            + "\n";

        this[ALIAS.invoice.total_ttc_par_tva] += lines
                .filter((fact) => fact.tva === tva)
                .reduce((prev, curr) => {
                    return prev + (curr.quantity * curr.price_pu_ttc)
                }, 0)
                .toFixed(2)
            + "\n";
    })
}

function manageCarriage (label) {
    // retours chariots
    const RC = "\n";
    if (label.length < 43) return RC;
    if (label.length < 86) return RC + RC;
    if (label.length < 172) return RC + RC + RC;
    if (label.length < 344) return RC + RC + RC + RC;
}

function calculer_TVA (quantity, price_pu_ttc, tva) {
    return (quantity * price_pu_ttc) - (((quantity * price_pu_ttc) / (1 + (tva / 100))));
}

function calculer_TTC (quantity, price_pu_ttc) {
    return (quantity * price_pu_ttc);
}

function calculer_HT (quantity, price_pu_ttc, tva) {
    return ((quantity * price_pu_ttc) / (1 + (tva / 100)));
}

function formaterAdress (adress1, adress2, inline = false) {
    if (inline) return adress2 ? adress1 + " - " + adress2 : adress1
    if (!inline) return adress2 ? adress1 + "\n" + adress2 : adress1
}

function formaterDate (myDate) {
    return Math.ceil(Math.abs((new Date(myDate)) - (new Date('1899-12-30'))) / (1000 * 60 * 60 * 24));
}

function formaterHour (myHour) {
    return (myHour.getUTCHours() + (myHour.getUTCMinutes() / 60)) / 24;
}

module.exports = {
    getAllFields,
    FieldsForInvoice,
    generateLinesInvoiceGetSkillsForItsClients,
    getAllFieldsForGetSkillsDocuments,
    getAllFieldsForSchoolDocuments
};