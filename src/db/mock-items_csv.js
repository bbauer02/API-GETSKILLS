const csvItems = [
    {
        csvItem_id: 1,
        field: "User_firstname;User_lastname;User_phone;Exam_label;sessionHasExam_adressExam;sessionUserOption_isCandidate;Examinator_firstname;Examinator_lastname",
        label: "Prénom;Nom;Téléphone;Epreuve;AdressEpreuve;EstCandidat;PrénomExaminateur;NomExaminateur",
        inLine: false,
        test_id: 3
    },
    {
        csvItem_id: 2,
        field: "User_firstname;User_city;Exam_label",
        label: "Prénom;City;Epreuve",
        inLine: true,
        test_id: 4
    }
];

module.exports = csvItems;