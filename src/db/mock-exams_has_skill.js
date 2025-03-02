// exam_has_skills.js
const examHasSkills = [
    // Exam 1 - test_id: 2 (DELF mais devrait être 1 selon le commentaire)
    // Associer avec des skills du test_id 1 (DELF) car selon commentaire
    { exam_id: 1, skill_id: 6 },  // Compréhension des écrits
    { exam_id: 1, skill_id: 7 },  // Comprendre la correspondance
    { exam_id: 1, skill_id: 9 },  // Lire pour s'informer et discuter
    { exam_id: 1, skill_id: 11 }, // Production écrite

    // Exam 2 - test_id: 2 (DELF)
    // Associer avec des skills du test_id 1 (DELF)
    { exam_id: 2, skill_id: 1 },  // Compréhension de l'oral
    { exam_id: 2, skill_id: 5 },  // Comprendre des émissions de radio
    { exam_id: 2, skill_id: 16 }, // Production orale
    { exam_id: 2, skill_id: 17 }, // Monologue suivi

    // Exam 3 - test_id: 3 (JLPT)
    { exam_id: 3, skill_id: 20 }, // Connaissances linguistiques
    { exam_id: 3, skill_id: 24 }, // Vocabulaire - Mots courants
    { exam_id: 3, skill_id: 25 }, // Vocabulaire - Expressions idiomatiques

    // Exam 4 - test_id: 3 (JLPT)
    { exam_id: 4, skill_id: 28 }, // Compréhension écrite
    { exam_id: 4, skill_id: 30 }, // Compréhension détaillée de textes
    { exam_id: 4, skill_id: 31 }, // Compréhension d'articles intégraux

    // Exam 5 - test_id: 3 (JLPT)
    { exam_id: 5, skill_id: 33 }, // Compréhension orale
    { exam_id: 5, skill_id: 34 }, // Compréhension de conversations courtes
    { exam_id: 5, skill_id: 36 }, // Compréhension de monologues

    // Exam 6 - test_id: 2 (DELF)
    // Associer avec des skills du test_id 1 (DELF)
    { exam_id: 6, skill_id: 6 },  // Compréhension des écrits
    { exam_id: 6, skill_id: 10 }, // Lire des instructions
    { exam_id: 6, skill_id: 11 }, // Production écrite
    { exam_id: 6, skill_id: 13 }, // Essais et rapports

    // Exam 7 - test_id: 2 (DELF)
    // Associer avec des skills du test_id 1 (DELF)
    { exam_id: 7, skill_id: 1 },  // Compréhension de l'oral
    { exam_id: 7, skill_id: 2 },  // Comprendre une interaction entre locuteurs natifs
    { exam_id: 7, skill_id: 16 }, // Production orale
    { exam_id: 7, skill_id: 18 }, // Monologue suivi : argumenter

    // Exam 8 - test_id: 4 (TOEIC)
    { exam_id: 8, skill_id: 38 }, // Listening Comprehension
    { exam_id: 8, skill_id: 41 }, // Short Conversation Analysis
    { exam_id: 8, skill_id: 42 }, // Short Talk Comprehension

    // Exam 9 - test_id: 2 (DELF)
    // Associer avec des skills du test_id 1 (DELF)
    { exam_id: 9, skill_id: 6 },  // Compréhension des écrits
    { exam_id: 9, skill_id: 11 }, // Production écrite

    // Exam 10 - test_id: 2 (DELF)
    // Associer avec des skills du test_id 1 (DELF)
    { exam_id: 10, skill_id: 1 },  // Compréhension de l'oral
    { exam_id: 10, skill_id: 16 }, // Production orale

    // Exam 11 - test_id: 2 (DELF)
    // Associer avec des skills du test_id 1 (DELF)
    { exam_id: 11, skill_id: 1 },  // Compréhension de l'oral
    { exam_id: 11, skill_id: 3 },  // Comprendre en tant qu'auditeur
    { exam_id: 11, skill_id: 16 }, // Production orale
    { exam_id: 11, skill_id: 19 }, // S'adresser à un auditoire

    // Exam 12 - test_id: 3 (JLPT)
    { exam_id: 12, skill_id: 33 }, // Compréhension orale
    { exam_id: 12, skill_id: 35 }, // Compréhension de dialogues
    { exam_id: 12, skill_id: 37 }, // Compréhension d'annonces publiques

    // Exam 13 - test_id: 3 (JLPT)
    { exam_id: 13, skill_id: 20 }, // Connaissances linguistiques
    { exam_id: 13, skill_id: 23 }, // Grammaire - Structures de phrases
    { exam_id: 13, skill_id: 28 }, // Compréhension écrite
    { exam_id: 13, skill_id: 32 }, // Lecture de documents authentiques

    // Exam 14 - test_id: 3 (JLPT)
    { exam_id: 14, skill_id: 26 }, // Kanji - Lecture
    { exam_id: 14, skill_id: 27 }, // Kanji - Écriture
];

module.exports = examHasSkills;