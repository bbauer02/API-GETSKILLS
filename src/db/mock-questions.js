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
          type: "MCQ",
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
      }
]

module.exports = questions;