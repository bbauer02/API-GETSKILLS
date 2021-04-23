
const exams = [
    {
        exam_id: 1,
        test_id: 1,
        label: "Epreuve écrite",
        isWritten: true,
        isOption: false,
        price: 200,
        coeff: 2,
        nbrQuestions:100,
        duration: 120,
        successScore: 100
    },
    {
        exam_id: 2,
        label: "Epreuve Orale",
        isWritten: false,
        isOption: false,
        price: 150,
        coeff: 2,
        nbrQuestions:0,
        duration: 60,
        successScore: 100
    },
    {
        exam_id: 3,
        label: "Vocabulaire",
        isWritten: true,
        isOption: false,
        price: 150,
        coeff: 1,
        nbrQuestions:100,
        duration: 60,
        successScore: 100
    },
    {
        exam_id: 4,
        label: "Lecture",
        isWritten: true,
        isOption: false,
        price: 150,
        coeff: 1,
        nbrQuestions:100,
        duration: 60,
        successScore: 100
    },
    {
        exam_id: 5,
        label: "Ecoute",
        isWritten: true,
        isOption: false,
        price: 150,
        coeff: 1,
        nbrQuestions:100,
        duration: 60,
        successScore: 100
    }
    
];

module.exports = exams;