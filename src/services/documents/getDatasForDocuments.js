const { cp } = require("fs");
const {models} = require("../../models");

function getDate (myDate, localString, timeZone) {
    const d = new Date(myDate);
    const locald = d.toLocaleDateString(localString, {timeZone})
    return locald.split(', ')[0];
}
function getHour (myDate, localString, timeZone) {
    const d = new Date(myDate);
    return d.toTimeString(localString, {timeZone}).split(" ")[0];
}
async function getDataForDocuments(institutId, sessionId, userId = null) {
    const datas =  JSON.parse(JSON.stringify(await models['Session'].findOne({
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
                                                  required: false,
                                                  where: {session_id: sessionId}
                                              }
                                          ]
                                  }
                              ]
                      }
                  ]
          },
      ]
    }))); 
    // Formatage date et heure du début et fin de la session
    datas.sessionStartDate = getDate(datas.start, 'fr-fr', 'Europe/Paris');
    datas.sessionStartHour = getHour(datas.start, 'fr-fr', 'Europe/Paris');
    datas.sessionEndDate = getDate(datas.end, 'fr-fr', 'Europe/Paris');
    datas.sessionEndHour = getHour(datas.end, 'fr-fr', 'Europe/Paris');
    // Formatage des adresses de l'institut
    if (datas.Institut.adress2 !== "") {
        datas.Institut.adress = datas.Institut.adress1 + "\n" + datas.Institut.adress2;
    }
    else {
        datas.Institut.adress = datas.Institut.adress1
    }
    
    const produits = [];
    // Formatage des données des utilisateurs
    for (let i = 0; i < datas.sessionUsers.length; i++) {
        // Numero d'inscription
        datas.sessionUsers[i].User.numInscription = new Date(datas.sessionUsers[i].inscription).getFullYear().toString() + new Date(datas.sessionUsers[i].inscription).getMonth().toString().padStart(2, "0") + datas.sessionUsers[i].sessionUser_id.toString().padStart(6, "0");
        // Adresse des utilisateurs
        if (datas.sessionUsers[i].User.adress2 !== "") {
            datas.sessionUsers[i].User.adress = datas.sessionUsers[i].User.adress1 + "\n" + datas.sessionUsers[i].User.adress2;
        }
        else {
            datas.sessionUsers[i].User.adress = datas.sessionUsers[i].User.adress1
        }
        // nbrExams
        datas.sessionUsers[i].User.nbrExam = datas.sessionUsers[i].sessionUserOptions.length;
        // Civilité
        const CIVILITY = {
            1: {
                label: 'Mr.'
            },
            2: {
                label: 'Mme.'
            }
        };
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
        datas.sessionUsers[i].User.civility = CIVILITY[datas.sessionUsers[i].User.civility].label;

        // Formatage date et heure de début de l'exam
        datas.sessionUsers[i].dateInscription = getDate(datas.sessionUsers[i].inscription, 'fr-fr', 'Europe/Paris');
        datas.sessionUsers[i].heureInscription = getHour(datas.sessionUsers[i].inscription, 'fr-fr', 'Europe/Paris');
        // Formatage date et heure

        datas.sessionUsers[i].facture = { produits:[]};
       
        datas.sessionUsers[i].sessionUserOptions.forEach((sessionUserOption, index) => {
            if(sessionUserOption.DateTime &&  sessionUserOption.DateTime !== "") {
                datas.sessionUsers[i].sessionUserOptions[index].date = getDate(sessionUserOption.DateTime, 'fr-fr', 'Europe/Paris');
                datas.sessionUsers[i].sessionUserOptions[index].heure = getHour(sessionUserOption.DateTime, 'fr-fr', 'Europe/Paris');
            }
            else {
                datas.sessionUsers[i].sessionUserOptions[index].date = getDate(sessionUserOption.Exam.sessionHasExams[0].DateTime, 'fr-fr', 'Europe/Paris');
                datas.sessionUsers[i].sessionUserOptions[index].heure = getHour(sessionUserOption.Exam.sessionHasExams[0].DateTime, 'fr-fr', 'Europe/Paris');
            }
            // Formatage Facture
            
           const exam = datas.sessionUsers[i].sessionUserOptions[index].Exam.label;
           const prix_unitaire_HT = datas.sessionUsers[i].sessionUserOptions[index].user_price ? datas.sessionUsers[i].sessionUserOptions[index].user_price : datas.sessionUsers[i].sessionUserOptions[index].Exam.InstitutHasPrices[0]?.price ? datas.sessionUsers[i].sessionUserOptions[index].Exam.InstitutHasPrices[0].price : datas.sessionUsers[i].sessionUserOptions[index].Exam.price;
           const quantite = 1;
           const TVA = datas.sessionUsers[i].sessionUserOptions[index].tva ? datas.sessionUsers[i].sessionUserOptions[index].tva : datas.sessionUsers[i].sessionUserOptions[index].Exam.InstitutHasPrices[0]?.tva? datas.sessionUsers[i].sessionUserOptions[index].Exam.InstitutHasPrices[0]?.tva : 20;
           let prix_unitaire_TTC = prix_unitaire_HT * ( 1 + (TVA / 100));
           prix_unitaire_TTC = parseFloat(prix_unitaire_TTC.toFixed(2));
           let total_HT = quantite * prix_unitaire_HT;
           total_HT = parseFloat(total_HT.toFixed(2));
           let total_TTC = quantite * prix_unitaire_TTC;
           total_TTC = parseFloat(total_TTC.toFixed(2));

           const produit = {
            exam,
            prix_unitaire_HT,
            prix_unitaire_TTC,
            quantite,
            TVA,
            total_HT,
            total_TTC
           }
           datas.sessionUsers[i].facture.produits.push(produit);
           datas.sessionUsers[i].facture.TVA = TVA;
        }); 
        // On fait la somme TTC et HT. 
        let total_HT = 0;
        let total_TTC = 0;
        datas.sessionUsers[i].facture.produits.forEach((produit, index) => {
           
            total_HT += produit.total_HT;
            total_TTC += produit.prix_unitaire_TTC;
        })
        let total_TVA = parseFloat((total_HT * (datas.sessionUsers[i].facture.TVA/100)).toFixed(2));
        datas.sessionUsers[i].facture.total_TVA = total_TVA;
        datas.sessionUsers[i].facture.total_HT = total_HT;
        datas.sessionUsers[i].facture.total_TTC = total_TTC;
        datas.sessionUsers[i].facture.numero_facture = new Date(datas.sessionUsers[i].inscription).getFullYear().toString() + new Date(datas.sessionUsers[i].inscription).getMonth().toString().padStart(2, "0") + datas.sessionUsers[i].sessionUser_id.toString().padStart(6, "0");
        datas.sessionUsers[i].facture.reference = new Date(datas.sessionUsers[i].inscription).getFullYear().toString() + new Date(datas.sessionUsers[i].inscription).getMonth().toString().padStart(2, "0") + datas.Test.label + '-' + datas.sessionUsers[i].sessionUser_id.toString().padStart(6, "0");
        datas.sessionUsers[i].facture.facture_date = getDate(new Date(),'fr-fr', 'Europe/Paris');
        datas.sessionUsers[i].facture.paymentModeLabel = PAYMENTS[datas.sessionUsers[i].paymentMode].label;
       
    }
    
    return datas;
}

module.exports = { getDataForDocuments }