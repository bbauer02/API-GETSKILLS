const skills = [
    // DELF (test_id = 1) - Basé sur le CECRL
    {
        skill_id: 1,
        label: "Compréhension de l'oral",
        parent_id: null,
        test_id: 1
    },
    {
        skill_id: 2,
        label: "Comprendre une interaction entre locuteurs natifs",
        parent_id: 1,
        test_id: 1
    },
    {
        skill_id: 3,
        label: "Comprendre en tant qu'auditeur",
        parent_id: 1,
        test_id: 1
    },
    {
        skill_id: 4,
        label: "Comprendre des annonces et instructions",
        parent_id: 1,
        test_id: 1
    },
    {
        skill_id: 5,
        label: "Comprendre des émissions de radio et des enregistrements",
        parent_id: 1,
        test_id: 1
    },
    {
        skill_id: 6,
        label: "Compréhension des écrits",
        parent_id: null,
        test_id: 1
    },
    {
        skill_id: 7,
        label: "Comprendre la correspondance",
        parent_id: 6,
        test_id: 1
    },
    {
        skill_id: 8,
        label: "Lire pour s'orienter",
        parent_id: 6,
        test_id: 1
    },
    {
        skill_id: 9,
        label: "Lire pour s'informer et discuter",
        parent_id: 6,
        test_id: 1
    },
    {
        skill_id: 10,
        label: "Lire des instructions",
        parent_id: 6,
        test_id: 1
    },
    {
        skill_id: 11,
        label: "Production écrite",
        parent_id: null,
        test_id: 1
    },
    {
        skill_id: 12,
        label: "Écriture créative",
        parent_id: 11,
        test_id: 1
    },
    {
        skill_id: 13,
        label: "Essais et rapports",
        parent_id: 11,
        test_id: 1
    },
    {
        skill_id: 14,
        label: "Prendre des notes",
        parent_id: 11,
        test_id: 1
    },
    {
        skill_id: 15,
        label: "Traiter un texte",
        parent_id: 11,
        test_id: 1
    },
    {
        skill_id: 16,
        label: "Production orale",
        parent_id: null,
        test_id: 1
    },
    {
        skill_id: 17,
        label: "Monologue suivi : décrire l'expérience",
        parent_id: 16,
        test_id: 1
    },
    {
        skill_id: 18,
        label: "Monologue suivi : argumenter",
        parent_id: 16,
        test_id: 1
    },
    {
        skill_id: 19,
        label: "S'adresser à un auditoire",
        parent_id: 16,
        test_id: 1
    },

    // JLPT (test_id = 3) - Structure japonaise détaillée
    {
        skill_id: 20,
        label: "Connaissances linguistiques",
        parent_id: null,
        test_id: 3
    },
    {
        skill_id: 21,
        label: "Grammaire - Formes verbales",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 22,
        label: "Grammaire - Particules",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 23,
        label: "Grammaire - Structures de phrases",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 24,
        label: "Vocabulaire - Mots courants",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 25,
        label: "Vocabulaire - Expressions idiomatiques",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 26,
        label: "Kanji - Lecture",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 27,
        label: "Kanji - Écriture",
        parent_id: 20,
        test_id: 3
    },
    {
        skill_id: 28,
        label: "Compréhension écrite",
        parent_id: null,
        test_id: 3
    },
    {
        skill_id: 29,
        label: "Compréhension rapide",
        parent_id: 28,
        test_id: 3
    },
    {
        skill_id: 30,
        label: "Compréhension détaillée de textes",
        parent_id: 28,
        test_id: 3
    },
    {
        skill_id: 31,
        label: "Compréhension d'articles intégraux",
        parent_id: 28,
        test_id: 3
    },
    {
        skill_id: 32,
        label: "Lecture de documents authentiques",
        parent_id: 28,
        test_id: 3
    },
    {
        skill_id: 33,
        label: "Compréhension orale",
        parent_id: null,
        test_id: 3
    },
    {
        skill_id: 34,
        label: "Compréhension de conversations courtes",
        parent_id: 33,
        test_id: 3
    },
    {
        skill_id: 35,
        label: "Compréhension de dialogues",
        parent_id: 33,
        test_id: 3
    },
    {
        skill_id: 36,
        label: "Compréhension de monologues",
        parent_id: 33,
        test_id: 3
    },
    {
        skill_id: 37,
        label: "Compréhension d'annonces publiques",
        parent_id: 33,
        test_id: 3
    },

    // TOEIC (test_id = 4) - Format professionnel détaillé
    {
        skill_id: 38,
        label: "Listening Comprehension",
        parent_id: null,
        test_id: 4
    },
    {
        skill_id: 39,
        label: "Photograph Description",
        parent_id: 38,
        test_id: 4
    },
    {
        skill_id: 40,
        label: "Question-Response Comprehension",
        parent_id: 38,
        test_id: 4
    },
    {
        skill_id: 41,
        label: "Short Conversation Analysis",
        parent_id: 38,
        test_id: 4
    },
    {
        skill_id: 42,
        label: "Short Talk Comprehension",
        parent_id: 38,
        test_id: 4
    },
    {
        skill_id: 43,
        label: "Reading Comprehension",
        parent_id: null,
        test_id: 4
    },
    {
        skill_id: 44,
        label: "Incomplete Sentences",
        parent_id: 43,
        test_id: 4
    },
    {
        skill_id: 45,
        label: "Text Completion",
        parent_id: 43,
        test_id: 4
    },
    {
        skill_id: 46,
        label: "Single Passage Reading",
        parent_id: 43,
        test_id: 4
    },
    {
        skill_id: 47,
        label: "Multiple Passage Reading",
        parent_id: 43,
        test_id: 4
    },
    {
        skill_id: 48,
        label: "Business Communication",
        parent_id: null,
        test_id: 4
    },
    {
        skill_id: 49,
        label: "Email Writing",
        parent_id: 48,
        test_id: 4
    },
    {
        skill_id: 50,
        label: "Business Document Analysis",
        parent_id: 48,
        test_id: 4
    },
    {
        skill_id: 51,
        label: "Professional Vocabulary Usage",
        parent_id: 48,
        test_id: 4
    },
    {
        skill_id: 52,
        label: "Business Etiquette Understanding",
        parent_id: 48,
        test_id: 4
    }
];

module.exports = skills;