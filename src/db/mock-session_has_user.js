const sessionUsers = [
    {
        sessionUser_id: 1,
        session_id: 1,
        user_id: 2,
        paymentMode: 1,
        hasPaid: false,
        informations : "Informations sur Ayaka Oyama."
    },
    {
        sessionUser_id: 2,
        session_id: 2,
        user_id: 1,
        paymentMode: 1,
        hasPaid: true,
        informations : "Information sur Baptiste Bauer."
    },
    {
        sessionUser_id: 3,
        session_id: 2,
        user_id: 3,
        paymentMode: 1,
        hasPaid: false,
        informations : "Information sur Christophe Lefebre."
    }
];

module.exports = sessionUsers;