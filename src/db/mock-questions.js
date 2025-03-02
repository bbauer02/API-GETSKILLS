const questions = [

    {
        // Champs de base dans la table questions
        question_id: 1,
        label: "CO-A1-01",
        test_id: 1,                    // DELF
        level_id: 1,                   // A1
        skills: [2, 3],                // IDs des compétences
        instruction: "<p>Écoutez la conversation et choisissez la bonne réponse.</p>",
        duration: 30,                  // en secondes
        points: 5,
        // Colonne question_data en JSON
        question_data: {
          type: "UCQ",
          content: {
            text: "Dans le dialogue, où va la femme ?",
            choices: [
              { id: 1, text: "À la boulangerie", isCorrect: true },
              { id: 2, text: "Au supermarché", isCorrect: false },
              { id: 3, text: "À la pharmacie", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 2,
        label: "CE-A1-01",
        test_id: 1,
        level_id: 1,
        skills: [7],
        instruction: "<p>Lisez le message et complétez avec les mots manquants.</p>",
        duration: 45,
        points: 8,
        question_data: {
          type: "FillInTheBlanks",
          content: {
            text: "Bonjour, je m'appelle ___ et j'habite à ___. J'ai ___ ans.",
            answers: ["Marie", "Paris", "25"],
            blankSymbol: "___"
          }
        }
      },
      {
        question_id: 3,
        label: "CE-A2-01",
        test_id: 1,
        level_id: 2,
        skills: [9, 10],
        instruction: "<p>Lisez le texte et surlignez les informations importantes.</p>",
        duration: 60,
        points: 10,
        question_data: {
          type: "Highlight",
          content: {
            text: "Le nouveau musée ouvrira ses portes le 15 juin. Les visiteurs pourront voir des œuvres d'art moderne.",
            answers: ["15 juin", "musée", "œuvres d'art moderne"]
          }
        }
      }, 
      {
        question_id: 4,
        label: "JLPT-N5-01",
        test_id: 3,   // JLPT
        level_id: 6,  // N5
        skills: [21, 24],  // Grammaire - Formes verbales, Vocabulaire - Mots courants
        instruction: "<p>Choisissez la bonne réponse.</p>",
        duration: 30,
        points: 5,
        question_data: {
            type: "MCQ",
            content: {
                text: "これは何ですか？",
                choices: [
                    { id: 1, text: "ペンです。", isCorrect: true },
                    { id: 2, text: "机です。", isCorrect: false },
                    { id: 3, text: "いぬです。", isCorrect: false }
                ]
            }
        }
    }, 
    {
      question_id: 5,
      label: "JLPT-N4-01",
      test_id: 3,
      level_id: 7,  // N4
      skills: [22, 29], // Particules, Compréhension rapide
      instruction: "<p>Complétez la phrase avec la bonne particule.</p>",
      duration: 45,
      points: 8,
      question_data: {
          type: "FillInTheBlanks",
          content: {
              text: "昨日、友達___映画を見ました。",
              answers: ["と"],
              blankSymbol: "___"
          }
      }
  },

  // JLPT N3
  {
      question_id: 6,
      label: "JLPT-N3-01",
      test_id: 3,
      level_id: 8,  // N3
      skills: [30], // Compréhension détaillée de textes
      instruction: "<p>Lisez le texte et sélectionnez les informations importantes.</p>",
      duration: 60,
      points: 10,
      question_data: {
          type: "Highlight",
          content: {
              text: "新しいレストランが駅の近くにオープンしました。料理はとても美味しく、価格も安いです。",
              answers: ["新しいレストラン", "駅の近く", "料理", "美味しく", "価格"]
          }
      }
  },

  // JLPT N2
  {
      question_id: 7,
      label: "JLPT-N2-01",
      test_id: 3,
      level_id: 9,  // N2
      skills: [36], // Compréhension de monologues
      instruction: "<p>Écoutez l'audio et répondez à la question.</p>",
      duration: 90,
      points: 12,
      question_data: {
          type: "MCQ",
          content: {
              text: "話の内容は何ですか？",
              choices: [
                  { id: 1, text: "仕事の面接", isCorrect: true },
                  { id: 2, text: "旅行の計画", isCorrect: false },
                  { id: 3, text: "買い物の話", isCorrect: false }
              ]
          }
      }
  },

  // JLPT N1
  {
      question_id: 8,
      label: "JLPT-N1-01",
      test_id: 3,
      level_id: 10,  // N1
      skills: [31], // Compréhension d'articles intégraux
      instruction: "<p>Analysez le texte et répondez à la question.</p>",
      duration: 120,
      points: 15,
      question_data: {
          type: "MCQ",
          content: {
              text: "この文章の筆者の意見は何ですか？",
              choices: [
                  { id: 1, text: "技術の進歩は重要", isCorrect: true },
                  { id: 2, text: "過去の方法が最適", isCorrect: false },
                  { id: 3, text: "変化は必要ない", isCorrect: false }
              ]
          }
      }
  }, 
  {
    question_id: 9,
    label: "TOEIC-01",
    test_id: 4,  // TOEIC
    level_id: null,  // Pas de niveau pour le TOEIC
    skills: [44], // Incomplete Sentences
    instruction: "<p>Complétez la phrase avec la bonne option.</p>",
    duration: 30,
    points: 5,
    question_data: {
        type: "MCQ",
        content: {
            text: "The manager ___ to attend the meeting next Monday.",
            choices: [
                { id: 1, text: "plans", isCorrect: true },
                { id: 2, text: "plan", isCorrect: false },
                { id: 3, text: "planning", isCorrect: false }
            ]
        }
    }
},

{
    question_id: 10,
    label: "TOEIC-02",
    test_id: 4,
    level_id: null,
    skills: [42], // Short Talk Comprehension
    instruction: "<p>Écoutez le dialogue et répondez à la question.</p>",
    duration: 45,
    points: 8,
    question_data: {
        type: "MCQ",
        content: {
            text: "What does the woman want to do?",
            choices: [
                { id: 1, text: "Reschedule the appointment", isCorrect: true },
                { id: 2, text: "Cancel the meeting", isCorrect: false },
                { id: 3, text: "Confirm the order", isCorrect: false }
            ]
        }
    }
},
// DELF A2
{
    question_id: 11,
    label: "CO-A2-02",
    test_id: 1,
    level_id: 2,
    skills: [3, 6], // Compréhension orale avancée
    instruction: "<p>Écoutez l'annonce et répondez à la question.</p>",
    duration: 40,
    points: 6,
    question_data: {
        type: "MCQ",
        content: {
            text: "Quelle est l'information principale ?",
            choices: [
                { id: 1, text: "Un changement d'horaire", isCorrect: true },
                { id: 2, text: "Un nouveau produit", isCorrect: false },
                { id: 3, text: "Une promotion spéciale", isCorrect: false }
            ]
        }
    }
},
// JLPT N5 - Deuxième question
{
    question_id: 12,
    label: "JLPT-N5-02",
    test_id: 3,
    level_id: 6,
    skills: [25], // Lecture de phrases courtes
    instruction: "<p>Lisez la phrase et sélectionnez la réponse correcte.</p>",
    duration: 35,
    points: 5,
    question_data: {
        type: "UCQ",
        content: {
            text: "このペンは___です。",
            choices: [
                { id: 1, text: "赤い", isCorrect: true },
                { id: 2, text: "寒い", isCorrect: false },
                { id: 3, text: "高い", isCorrect: false }
            ]
        }
    }
},
// TOEIC - Nouvelle question
{
    question_id: 13,
    label: "TOEIC-03",
    test_id: 4,
    level_id: null,
    skills: [43], // Business English
    instruction: "<p>Complétez la phrase avec la bonne option.</p>",
    duration: 30,
    points: 5,
    question_data: {
        type: "MCQ",
        content: {
            text: "The company has decided to ___ a new marketing strategy.",
            choices: [
                { id: 1, text: "implement", isCorrect: true },
                { id: 2, text: "buy", isCorrect: false },
                { id: 3, text: "sell", isCorrect: false }
            ]
        }
    }
}, 
{
    question_id: 14,
    label: "CO-A1-02",
    test_id: 1,
    level_id: 1,
    skills: [2, 4],
    instruction: "<p>Écoutez l'annonce à la gare et répondez à la question.</p>",
    duration: 30,
    points: 5,
    question_data: {
      type: "MCQ",
      content: {
        text: "À quelle heure part le train pour Lyon ?",
        choices: [
          { id: 1, text: "14h30", isCorrect: true },
          { id: 2, text: "14h45", isCorrect: false },
          { id: 3, text: "15h30", isCorrect: false }
        ]
      }
    }
  },
  {
    question_id: 15,
    label: "CE-A1-03",
    test_id: 1,
    level_id: 1,
    skills: [7, 8],
    instruction: "<p>Lisez ce message et répondez aux questions.</p>",
    duration: 45,
    points: 6,
    question_data: {
      type: "UCQ",
      content: {
        text: "Salut Marie ! Je suis au café près de la station de métro. Tu veux me rejoindre pour un café ? Je reste jusqu'à 16h. Thomas",
        choices: [
          { id: 1, text: "Thomas est dans un café", isCorrect: true },
          { id: 2, text: "Thomas est dans le métro", isCorrect: false },
          { id: 3, text: "Thomas est chez Marie", isCorrect: false }
        ]
      }
    }
  },
  {
    question_id: 16,
    label: "PE-A1-01",
    test_id: 1,
    level_id: 1,
    skills: [11, 12],
    instruction: "<p>Vous écrivez une carte postale à un ami. Complétez le texte avec les mots proposés.</p>",
    duration: 60,
    points: 8,
    question_data: {
      type: "FillInTheBlanks",
      content: {
        text: "Cher ___, Je suis en vacances à ___. Il fait très ___. Je rentre ___. À bientôt !",
        answers: ["Paul", "Paris", "beau", "dimanche"],
        blankSymbol: "___"
      }
    }
  },

  // DELF A2 Questions (test_id: 1, level_id: 2)
  {
    question_id: 17,
    label: "CO-A2-03",
    test_id: 1,
    level_id: 2,
    skills: [3, 5],
    instruction: "<p>Écoutez le message sur le répondeur et répondez aux questions.</p>",
    duration: 45,
    points: 7,
    question_data: {
      type: "MCQ",
      content: {
        text: "Pourquoi la personne appelle-t-elle ?",
        choices: [
          { id: 1, text: "Pour annuler un rendez-vous", isCorrect: true },
          { id: 2, text: "Pour prendre un rendez-vous", isCorrect: false },
          { id: 3, text: "Pour confirmer un rendez-vous", isCorrect: false }
        ]
      }
    }
  },

  // JLPT N5 Questions (test_id: 3, level_id: 6)
  {
    question_id: 18,
    label: "JLPT-N5-03",
    test_id: 3,
    level_id: 6,
    skills: [21, 24],
    instruction: "<p>文法問題です。正しい答えを選んでください。</p>",
    duration: 40,
    points: 5,
    question_data: {
      type: "MCQ",
      content: {
        text: "私は毎日日本語___勉強します。",
        choices: [
          { id: 1, text: "を", isCorrect: true },
          { id: 2, text: "に", isCorrect: false },
          { id: 3, text: "が", isCorrect: false }
        ]
      }
    }
  },

  // JLPT N4 Questions (test_id: 3, level_id: 7)
  {
    question_id: 19,
    label: "JLPT-N4-02",
    test_id: 3,
    level_id: 7,
    skills: [22, 25],
    instruction: "<p>適切な言葉を選んでください。</p>",
    duration: 45,
    points: 6,
    question_data: {
      type: "MCQ",
      content: {
        text: "電車が＿＿＿から、タクシーで行きましょう。",
        choices: [
          { id: 1, text: "遅れている", isCorrect: true },
          { id: 2, text: "遅れる", isCorrect: false },
          { id: 3, text: "遅れた", isCorrect: false }
        ]
      }
    }
  },

  // TOEIC Questions (test_id: 4, no specific level)
  {
    question_id: 20,
    label: "TOEIC-04",
    test_id: 4,
    level_id: null,
    skills: [44, 51],
    instruction: "<p>Choose the word that best completes the sentence.</p>",
    duration: 60,
    points: 8,
    question_data: {
      type: "MCQ",
      content: {
        text: "The quarterly report ___ the company's strong financial performance.",
        choices: [
          { id: 1, text: "highlights", isCorrect: true },
          { id: 2, text: "highlighting", isCorrect: false },
          { id: 3, text: "highlighted", isCorrect: false }
        ]
      }
    }
  },

  // DELF Enfant A1 Questions (test_id: 5, level_id: 11)
  {
    question_id: 21,
    label: "CO-ENF-A1-01",
    test_id: 5,
    level_id: 11,
    skills: [2, 3],
    instruction: "<p>Écoute l'histoire et choisis la bonne image.</p>",
    duration: 30,
    points: 5,
    question_data: {
      type: "UCQ",
      content: {
        text: "Où est le chat dans l'histoire ?",
        choices: [
          { id: 1, text: "Sur le lit", isCorrect: true },
          { id: 2, text: "Sous la table", isCorrect: false },
          { id: 3, text: "Dans le jardin", isCorrect: false }
        ]
      }
    }
  },
    // DELF B1 Questions (test_id: 1, level_id: 3)
    {
        question_id: 22,
        label: "CO-B1-01",
        test_id: 1,
        level_id: 3,
        skills: [3, 5],
        instruction: "<p>Écoutez l'émission de radio et répondez aux questions.</p>",
        duration: 90,
        points: 10,
        question_data: {
          type: "MCQ",
          content: {
            text: "Quel est le thème principal de l'émission ?",
            choices: [
              { id: 1, text: "Les nouvelles technologies dans l'éducation", isCorrect: true },
              { id: 2, text: "Le système scolaire français", isCorrect: false },
              { id: 3, text: "Les méthodes d'apprentissage traditionnelles", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 23,
        label: "PE-B1-01",
        test_id: 1,
        level_id: 3,
        skills: [11, 12],
        instruction: "<p>Rédigez un email à votre ami pour lui raconter vos dernières vacances.</p>",
        duration: 120,
        points: 15,
        question_data: {
          type: "WritingTask",
          content: {
            text: "Écrivez un email de 160-180 mots. Incluez les éléments suivants :\n- Où vous êtes allé(e)\n- Ce que vous avez fait\n- Ce que vous avez le plus aimé\n- Une invitation à votre ami",
            minWords: 160,
            maxWords: 180,
            criteria: [
              "Respect de la consigne",
              "Cohérence du texte",
              "Vocabulaire approprié",
              "Grammaire correcte"
            ]
          }
        }
      },
      {
        question_id: 24,
        label: "JLPT-N5-03",
        test_id: 3,
        level_id: 6,
        skills: [21, 24],
        instruction: "<p>正しい答えを選んでください。</p>",
        duration: 45,
        points: 5,
        question_data: {
          type: "MCQ",
          content: {
            text: "わたしは まいにち がっこうに ___。",
            choices: [
              { id: 1, text: "いきます", isCorrect: true },
              { id: 2, text: "いきた", isCorrect: false },
              { id: 3, text: "いく", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 25,
        label: "TOEIC-LC-01",
        test_id: 4,
        level_id: null,
        skills: [38, 41],
        instruction: "<p>Listen to the conversation and answer the question.</p>",
        duration: 30,
        points: 5,
        question_data: {
          type: "MCQ",
          content: {
            text: "What will the woman probably do next?",
            choices: [
              { id: 1, text: "Send an email to the client", isCorrect: true },
              { id: 2, text: "Attend a meeting", isCorrect: false },
              { id: 3, text: "Call her supervisor", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 26,
        label: "DELF-ENF-A1-02",
        test_id: 5,
        level_id: 11,
        skills: [7, 8],
        instruction: "<p>Regarde l'image et réponds aux questions.</p>",
        duration: 45,
        points: 6,
        question_data: {
          type: "ImageMCQ",
          content: {
            text: "Où est le ballon ?",
            choices: [
              { id: 1, text: "Dans le jardin", isCorrect: true },
              { id: 2, text: "Dans la maison", isCorrect: false },
              { id: 3, text: "Sur le toit", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 27,
        label: "JLPT-N4-02",
        test_id: 3,
        level_id: 7,
        skills: [22, 23],
        instruction: "<p>適切な助詞を選んでください。</p>",
        duration: 40,
        points: 5,
        question_data: {
          type: "MCQ",
          content: {
            text: "新しい仕事___ 慣れましたか。",
            choices: [
              { id: 1, text: "に", isCorrect: true },
              { id: 2, text: "を", isCorrect: false },
              { id: 3, text: "が", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 28,
        label: "DELF-C1-01",
        test_id: 1,
        level_id: 4,
        skills: [9, 13],
        instruction: "<p>Analysez le texte suivant et rédigez une synthèse.</p>",
        duration: 180,
        points: 25,
        question_data: {
          type: "WritingTask",
          content: {
            text: "À partir des documents proposés, dégagez la problématique et rédigez une synthèse de 220-250 mots en présentant les différents points de vue sur le sujet.",
            minWords: 220,
            maxWords: 250,
            criteria: [
              "Compréhension des documents",
              "Capacité de synthèse",
              "Structure du texte",
              "Richesse linguistique"
            ]
          }
        }
      },
      {
        question_id: 29,
        label: "JLPT-N2-02",
        test_id: 3,
        level_id: 9,
        skills: [30, 31],
        instruction: "<p>次の文章を読んで、質問に答えてください。</p>",
        duration: 90,
        points: 10,
        question_data: {
          type: "Reading",
          content: {
            text: "環境問題に対する意識が高まる中、企業の社会的責任も重要視されている。持続可能な開発を目指す取り組みは、もはや選択肢ではなく必須となっている。",
            question: "この文章の主題として最も適切なものを選んでください。",
            choices: [
              { id: 1, text: "企業の環境への責任", isCorrect: true },
              { id: 2, text: "環境問題の現状", isCorrect: false },
              { id: 3, text: "持続可能な開発の定義", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 30,
        label: "TOEIC-RC-01",
        test_id: 4,
        level_id: null,
        skills: [43, 46],
        instruction: "<p>Read the document and answer the question.</p>",
        duration: 60,
        points: 8,
        question_data: {
          type: "MCQ",
          content: {
            text: "According to the document, what is the company's new policy?",
            choices: [
              { id: 1, text: "Flexible working hours", isCorrect: true },
              { id: 2, text: "Remote work only", isCorrect: false },
              { id: 3, text: "Extended lunch breaks", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 31,
        label: "DELF-C2-01",
        test_id: 1,
        level_id: 5,
        skills: [16, 18],
        instruction: "<p>Présentez un exposé structuré sur le sujet suivant.</p>",
        duration: 240,
        points: 30,
        question_data: {
          type: "Speaking",
          content: {
            preparation_time: 600,
            speaking_time: 300,
            text: "« L'intelligence artificielle va-t-elle transformer fondamentalement notre société ? » Développez votre point de vue en vous appuyant sur des exemples précis.",
            criteria: [
              "Clarté de l'argumentation",
              "Richesse lexicale",
              "Qualité de la prononciation",
              "Maîtrise des structures complexes"
            ]
          }
        }
      },
      {
        question_id: 32,
        label: "JLPT-N1-02",
        test_id: 3,
        level_id: 10,
        skills: [31, 32],
        instruction: "<p>次の評論文を読んで、問題に答えてください。</p>",
        duration: 150,
        points: 20,
        question_data: {
          type: "Reading",
          content: {
            text: "現代社会におけるメディアリテラシーの重要性は、情報過多時代において一層高まっている。その中で、批判的思考力の育成が不可欠となっている。",
            question: "筆者の主張として最も適切なものを選んでください。",
            choices: [
              { id: 1, text: "メディアリテラシーと批判的思考は密接な関係がある", isCorrect: true },
              { id: 2, text: "情報量の増加は必ずしも良いことではない", isCorrect: false },
              { id: 3, text: "現代社会では情報を得やすくなっている", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 33,
        label: "DELF-A1-03",
        test_id: 1,
        level_id: 1,
        skills: [2, 3],
        instruction: "<p>Écoutez le message et choisissez la bonne réponse.</p>",
        duration: 35,
        points: 5,
        question_data: {
          type: "MCQ",
          content: {
            text: "Quelle heure est-il dans le message ?",
            choices: [
              { id: 1, text: "14h30", isCorrect: true },
              { id: 2, text: "14h15", isCorrect: false },
              { id: 3, text: "14h45", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 34,
        label: "JLPT-N5-04",
        test_id: 3,
        level_id: 6,
        skills: [24, 25],
        instruction: "<p>適切な言葉を選んでください。</p>",
        duration: 40,
        points: 5,
        question_data: {
          type: "MCQ",
          content: {
            text: "母は今 ___ を作っています。",
            choices: [
              { id: 1, text: "ごはん", isCorrect: true },
              { id: 2, text: "えいが", isCorrect: false },
              { id: 3, text: "でんわ", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 35,
        label: "TOEIC-RC-02",
        test_id: 4,
        level_id: null,
        skills: [44, 45],
        instruction: "<p>Complete the sentence with the most appropriate word.</p>",
        duration: 45,
        points: 6,
        question_data: {
          type: "MCQ",
          content: {
            text: "The marketing team ___ their presentation to the board next week.",
            choices: [
              { id: 1, text: "will give", isCorrect: true },
              { id: 2, text: "gives", isCorrect: false },
              { id: 3, text: "giving", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 36,
        label: "DELF-ENF-A2-01",
        test_id: 5,
        level_id: 12,
        skills: [7, 8],
        instruction: "<p>Lis le texte et réponds aux questions.</p>",
        duration: 50,
        points: 7,
        question_data: {
          type: "Reading",
          content: {
            text: "Thomas aime beaucoup le sport. Le lundi, il fait du football. Le mercredi, il va à la piscine. Le samedi, il joue au tennis avec ses amis.",
            question: "Quel sport Thomas fait-il le lundi ?",
            choices: [
              { id: 1, text: "Le football", isCorrect: true },
              { id: 2, text: "La natation", isCorrect: false },
              { id: 3, text: "Le tennis", isCorrect: false }
            ]
          }
        }
      }, 
      {
        question_id: 37,
        label: "JLPT-N3-02",
        test_id: 3,
        level_id: 8,
        skills: [28, 29],
        instruction: "<p>文章を読んで、質問に答えてください。</p>",
        duration: 70,
        points: 8,
        question_data: {
          type: "Reading",
          content: {
            text: "日本の伝統的な祭りは、地域社会の結びつきを強める重要な役割を果たしてきました。現代では、若い世代の参加を促すために、新しい要素を取り入れる祭りも増えています。",
            question: "この文章の主題として最も適切なものを選んでください。",
            choices: [
              { id: 1, text: "祭りの現代的な変化と役割", isCorrect: true },
              { id: 2, text: "伝統的な祭りの衰退", isCorrect: false },
              { id: 3, text: "若者の祭り離れ", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 38,
        label: "DELF-B1-02",
        test_id: 1,
        level_id: 3,
        skills: [11, 13],
        instruction: "<p>Rédigez un texte argumentatif sur le sujet suivant.</p>",
        duration: 150,
        points: 20,
        question_data: {
          type: "WritingTask",
          content: {
            text: "« Les réseaux sociaux ont-ils un impact positif sur les relations humaines ? » Donnez votre opinion en l'illustrant d'exemples.",
            minWords: 180,
            maxWords: 200,
            criteria: [
              "Argumentation claire",
              "Exemples pertinents",
              "Structure cohérente",
              "Richesse lexicale"
            ]
          }
        }
      },
      {
        question_id: 39,
        label: "TOEIC-LC-02",
        test_id: 4,
        level_id: null,
        skills: [40, 41],
        instruction: "<p>Listen to the conversation and answer the questions.</p>",
        duration: 60,
        points: 8,
        question_data: {
          type: "MCQ",
          content: {
            text: "What does the man suggest about the project deadline?",
            choices: [
              { id: 1, text: "It should be extended", isCorrect: true },
              { id: 2, text: "It is too early", isCorrect: false },
              { id: 3, text: "It should remain unchanged", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 40,
        label: "JLPT-N2-03",
        test_id: 3,
        level_id: 9,
        skills: [23, 25],
        instruction: "<p>次の文の＿＿に入る最も適切な表現を選んでください。</p>",
        duration: 45,
        points: 6,
        question_data: {
          type: "MCQ",
          content: {
            text: "報告書を提出＿＿際は、必ず上司の確認を受けてください。",
            choices: [
              { id: 1, text: "する", isCorrect: true },
              { id: 2, text: "された", isCorrect: false },
              { id: 3, text: "している", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 41,
        label: "DELF-C1-02",
        test_id: 1,
        level_id: 4,
        skills: [16, 19],
        instruction: "<p>Faites un exposé structuré sur le sujet suivant.</p>",
        duration: 180,
        points: 25,
        question_data: {
          type: "Speaking",
          content: {
            preparation_time: 480,
            speaking_time: 300,
            text: "« Le développement durable est-il compatible avec la croissance économique ? » Présentez les différents aspects du débat.",
            criteria: [
              "Organisation des idées",
              "Qualité de l'argumentation",
              "Richesse du vocabulaire",
              "Prononciation et intonation"
            ]
          }
        }
      },
      {
        question_id: 42,
        label: "JLPT-N1-03",
        test_id: 3,
        level_id: 10,
        skills: [31, 32],
        instruction: "<p>次の評論文を読んで、問題に答えてください。</p>",
        duration: 120,
        points: 15,
        question_data: {
          type: "Reading",
          content: {
            text: "科学技術の発展は人類に多大な恩恵をもたらしてきた一方で、新たな倫理的課題も生み出している。特に人工知能の進歩は、従来の価値観や規範の再考を迫っている。",
            question: "筆者の主張として最も適切なものを選んでください。",
            choices: [
              { id: 1, text: "技術発展に伴う倫理的課題の重要性", isCorrect: true },
              { id: 2, text: "人工知能の危険性", isCorrect: false },
              { id: 3, text: "科学技術の限界", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 43,
        label: "DELF-ENF-A2-02",
        test_id: 5,
        level_id: 12,
        skills: [11, 12],
        instruction: "<p>Écris une petite histoire sur ton animal préféré.</p>",
        duration: 90,
        points: 10,
        question_data: {
          type: "WritingTask",
          content: {
            text: "Décris ton animal préféré. Explique pourquoi tu l'aimes et ce que tu fais avec lui. (80-100 mots)",
            minWords: 80,
            maxWords: 100,
            criteria: [
              "Description claire",
              "Utilisation du vocabulaire approprié",
              "Grammaire simple correcte",
              "Cohérence du texte"
            ]
          }
        }
      },
      {
        question_id: 44,
        label: "DELF-A2-03",
        test_id: 1,
        level_id: 2,
        skills: [16, 17],
        instruction: "<p>Décrivez une fête traditionnelle de votre pays.</p>",
        duration: 120,
        points: 15,
        question_data: {
          type: "Speaking",
          content: {
            preparation_time: 300,
            speaking_time: 180,
            topics: [
              "La date de la fête",
              "Les traditions associées",
              "Les activités typiques",
              "Votre expérience personnelle"
            ],
            criteria: [
              "Clarté de la description",
              "Utilisation du vocabulaire approprié",
              "Prononciation",
              "Fluidité du discours"
            ]
          }
        }
      },
      {
        question_id: 45,
        label: "JLPT-N4-03",
        test_id: 3,
        level_id: 7,
        skills: [26, 27],
        instruction: "<p>漢字の読み方として正しいものを選んでください。</p>",
        duration: 45,
        points: 6,
        question_data: {
          type: "MCQ",
          content: {
            text: "予約",
            choices: [
              { id: 1, text: "よやく", isCorrect: true },
              { id: 2, text: "よてい", isCorrect: false },
              { id: 3, text: "よこく", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 46,
        label: "TOEIC-RC-03",
        test_id: 4,
        level_id: null,
        skills: [48, 49],
        instruction: "<p>Read the email and complete it with appropriate business expressions.</p>",
        duration: 90,
        points: 12,
        question_data: {
          type: "FillInTheBlanks",
          content: {
            text: "Dear Mr. Johnson,\n\nI am writing to ___ our meeting scheduled for next week. Due to ___, I would like to ___ the meeting to Friday at 2 PM.\n\nI look forward to ___.\n\nBest regards,\nSarah Smith",
            answers: [
              "confirm",
              "unforeseen circumstances",
              "reschedule",
              "your response"
            ],
            blankSymbol: "___"
          }
        }
      },
      {
        question_id: 47,
        label: "DELF-C2-02",
        test_id: 1,
        level_id: 5,
        skills: [11, 13],
        instruction: "<p>Rédigez une synthèse des documents suivants.</p>",
        duration: 180,
        points: 25,
        question_data: {
          type: "WritingTask",
          content: {
            text: "À partir des documents proposés, analysez l'évolution du marché du travail face à la digitalisation. Présentez les différents points de vue et leurs implications sociétales. (300-350 mots)",
            minWords: 300,
            maxWords: 350,
            criteria: [
              "Analyse approfondie",
              "Synthèse pertinente",
              "Style académique",
              "Richesse lexicale"
            ]
          }
        }
      },
      {
        question_id: 48,
        label: "JLPT-N3-03",
        test_id: 3,
        level_id: 8,
        skills: [34, 35],
        instruction: "<p>会話を聞いて、質問に答えてください。</p>",
        duration: 60,
        points: 8,
        question_data: {
          type: "ListeningMCQ",
          content: {
            text: "男性は週末に何をする予定ですか。",
            choices: [
              { id: 1, text: "友達と買い物に行く", isCorrect: true },
              { id: 2, text: "家で勉強する", isCorrect: false },
              { id: 3, text: "映画を見る", isCorrect: false }
            ]
          }
        }
      },
      {
        question_id: 49,
        label: "DELF-ENF-A1-03",
        test_id: 5,
        level_id: 11,
        skills: [16, 17],
        instruction: "<p>Parle de ta famille et de tes amis.</p>",
        duration: 90,
        points: 10,
        question_data: {
          type: "Speaking",
          content: {
            preparation_time: 180,
            speaking_time: 120,
            topics: [
              "Les membres de ta famille",
              "Tes meilleurs amis",
              "Les activités que vous faites ensemble"
            ],
            criteria: [
              "Vocabulaire de la famille",
              "Phrases simples correctes",
              "Prononciation claire",
              "Communication du message"
            ]
          }
        }
      },
      {
        question_id: 50,
        label: "TOEIC-LC-03",
        test_id: 4,
        level_id: null,
        skills: [42, 43],
        instruction: "<p>Listen to the announcement and answer the question.</p>",
        duration: 45,
        points: 7,
        question_data: {
          type: "MCQ",
          content: {
            text: "What is being announced?",
            choices: [
              { id: 1, text: "A change in company policy", isCorrect: true },
              { id: 2, text: "A new product launch", isCorrect: false },
              { id: 3, text: "An office relocation", isCorrect: false }
            ]
          }
        }
      }
]

module.exports = questions;


