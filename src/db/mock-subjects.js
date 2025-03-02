// Mock subjects data
const subjects = [
    // DELF A1 Subjects
    {
        subject_id: 1,
        title: "DELF A1 - Compréhension et Production",
        description: "Examen complet DELF A1 comprenant compréhension orale, écrite et production écrite",
        test_id: 1,
        level_id: 1
    },
    {
        subject_id: 2,
        title: "DELF A1 - Expression Orale",
        description: "Épreuve d'expression orale DELF A1",
        test_id: 1,
        level_id: 1
    },

    // DELF A2 Subjects
    {
        subject_id: 3,
        title: "DELF A2 - Compréhension Globale",
        description: "Évaluation des compétences de compréhension niveau A2",
        test_id: 1,
        level_id: 2
    },
    {
        subject_id: 4,
        title: "DELF A2 - Production et Interaction",
        description: "Épreuves de production écrite et orale niveau A2",
        test_id: 1,
        level_id: 2
    },

    // DELF B1 Subjects
    {
        subject_id: 5,
        title: "DELF B1 - Compréhension Approfondie",
        description: "Évaluation complète des compétences de compréhension B1",
        test_id: 1,
        level_id: 3
    },

    // DELF C1 Subjects
    {
        subject_id: 6,
        title: "DELF C1 - Expression Académique",
        description: "Évaluation des compétences d'expression niveau C1",
        test_id: 1,
        level_id: 4
    },

    // DELF C2 Subjects
    {
        subject_id: 7,
        title: "DELF C2 - Maîtrise de la Langue",
        description: "Évaluation complète niveau C2",
        test_id: 1,
        level_id: 5
    },

    // JLPT N5 Subjects
    {
        subject_id: 8,
        title: "JLPT N5 - 基礎日本語",
        description: "Evaluation of basic Japanese language skills",
        test_id: 3,
        level_id: 6
    },

    // JLPT N4 Subjects
    {
        subject_id: 9,
        title: "JLPT N4 - 基本的な日本語",
        description: "Basic to intermediate Japanese evaluation",
        test_id: 3,
        level_id: 7
    },

    // JLPT N3 Subjects
    {
        subject_id: 10,
        title: "JLPT N3 - 中級日本語",
        description: "Intermediate Japanese language evaluation",
        test_id: 3,
        level_id: 8
    },

    // JLPT N2 Subjects
    {
        subject_id: 11,
        title: "JLPT N2 - 上級日本語",
        description: "Advanced Japanese language evaluation",
        test_id: 3,
        level_id: 9
    },

    // JLPT N1 Subjects
    {
        subject_id: 12,
        title: "JLPT N1 - 上級日本語マスター",
        description: "Master level Japanese evaluation",
        test_id: 3,
        level_id: 10
    },

    // TOEIC Subjects
    {
        subject_id: 13,
        title: "TOEIC - Listening Comprehension",
        description: "TOEIC listening section evaluation",
        test_id: 4,
        level_id: null
    },
    {
        subject_id: 14,
        title: "TOEIC - Reading Comprehension",
        description: "TOEIC reading section evaluation",
        test_id: 4,
        level_id: null
    },

    // DELF Enfant Subjects
    {
        subject_id: 15,
        title: "DELF Enfant A1 - Compétences de Base",
        description: "Évaluation adaptée aux enfants niveau A1",
        test_id: 5,
        level_id: 11
    },
    {
        subject_id: 16,
        title: "DELF Enfant A2 - Compétences Intermédiaires",
        description: "Évaluation adaptée aux enfants niveau A2",
        test_id: 5,
        level_id: 12
    }
];

// Mock subject_has_question associations
const subjectHasQuestions = [
    // DELF A1 - Compréhension et Production (subject_id: 1)
    { subject_id: 1, question_id: 1 },  // CO-A1-01
    { subject_id: 1, question_id: 2 },  // CE-A1-01
    { subject_id: 1, question_id: 14 }, // CO-A1-02
    { subject_id: 1, question_id: 15 }, // CE-A1-03
    { subject_id: 1, question_id: 16 }, // PE-A1-01
    { subject_id: 1, question_id: 33 }, // DELF-A1-03

    // DELF A2 - Compréhension Globale (subject_id: 3)
    { subject_id: 3, question_id: 3 },  // CE-A2-01
    { subject_id: 3, question_id: 11 }, // CO-A2-02
    { subject_id: 3, question_id: 17 }, // CO-A2-03
    { subject_id: 3, question_id: 44 }, // DELF-A2-03

    // DELF B1 - Compréhension Approfondie (subject_id: 5)
    { subject_id: 5, question_id: 22 }, // CO-B1-01
    { subject_id: 5, question_id: 23 }, // PE-B1-01
    { subject_id: 5, question_id: 38 }, // DELF-B1-02

    // JLPT N5 (subject_id: 8)
    { subject_id: 8, question_id: 4 },  // JLPT-N5-01
    { subject_id: 8, question_id: 12 }, // JLPT-N5-02
    { subject_id: 8, question_id: 18 }, // JLPT-N5-03
    { subject_id: 8, question_id: 24 }, // JLPT-N5-03
    { subject_id: 8, question_id: 34 }, // JLPT-N5-04

    // JLPT N4 (subject_id: 9)
    { subject_id: 9, question_id: 5 },  // JLPT-N4-01
    { subject_id: 9, question_id: 19 }, // JLPT-N4-02
    { subject_id: 9, question_id: 27 }, // JLPT-N4-02
    { subject_id: 9, question_id: 45 }, // JLPT-N4-03

    // JLPT N3 (subject_id: 10)
    { subject_id: 10, question_id: 6 }, // JLPT-N3-01
    { subject_id: 10, question_id: 37 }, // JLPT-N3-02
    { subject_id: 10, question_id: 48 }, // JLPT-N3-03

    // TOEIC - Listening Comprehension (subject_id: 13)
    { subject_id: 13, question_id: 10 }, // TOEIC-02
    { subject_id: 13, question_id: 25 }, // TOEIC-LC-01
    { subject_id: 13, question_id: 39 }, // TOEIC-LC-02
    { subject_id: 13, question_id: 50 }, // TOEIC-LC-03

    // TOEIC - Reading Comprehension (subject_id: 14)
    { subject_id: 14, question_id: 9 },  // TOEIC-01
    { subject_id: 14, question_id: 13 }, // TOEIC-03
    { subject_id: 14, question_id: 20 }, // TOEIC-04
    { subject_id: 14, question_id: 30 }, // TOEIC-RC-01
    { subject_id: 14, question_id: 35 }, // TOEIC-RC-02
    { subject_id: 14, question_id: 46 }, // TOEIC-RC-03

    // DELF Enfant A1 (subject_id: 15)
    { subject_id: 15, question_id: 21 }, // CO-ENF-A1-01
    { subject_id: 15, question_id: 26 }, // DELF-ENF-A1-02
    { subject_id: 15, question_id: 49 }, // DELF-ENF-A1-03

    // DELF Enfant A2 (subject_id: 16)
    { subject_id: 16, question_id: 36 }, // DELF-ENF-A2-01
    { subject_id: 16, question_id: 43 }  // DELF-ENF-A2-02
];

module.exports = {
    subjects,
    subjectHasQuestions
};