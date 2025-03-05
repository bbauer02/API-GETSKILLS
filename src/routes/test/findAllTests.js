const {Op} = require("sequelize");
const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/tests', isAuthenticated, async (req, res) => {
       try {
           const parameters = {};

           // Récupérer les informations de l'utilisateur depuis le token JWT
           const userId = req.accessToken.user_id;
           const userInstituts = req.accessToken.instituts || [];
           const systemRole = req.accessToken.systemRole;
           
           console.log(`DEBUG - findAllTests - User ID: ${userId}`);
           console.log(`DEBUG - findAllTests - System Role: ${systemRole ? systemRole.power : 'non défini'}`);
           
           // Vérifier si l'utilisateur est un administrateur système (power = 10)
           const isSystemAdmin = systemRole && systemRole.power === 10;
           console.log(`DEBUG - findAllTests - Est administrateur système: ${isSystemAdmin}`);
           
           // Extraire les IDs des instituts de l'utilisateur
           const userInstitutIds = userInstituts.map(institut => institut.institut_id);
           console.log(`DEBUG - findAllTests - Instituts de l'utilisateur: ${userInstitutIds.join(', ')}`);

           // Parameter : ARCHIVE (?archive=true)
           if(req.query.archive) {
               parameters.where = {isArchive: JSON.parse(req.query.archive)}
           } else {
               parameters.where = {isArchive: false}
           }

           // Parameter : ORDER
           parameters.order = [['label', 'ASC']]
           
           // Afficher les enfants également
           const showChildren = req.query.child !== "false";
           
           // Filtrer par institut propriétaire sauf pour l'administrateur système
           if (!isSystemAdmin && userInstitutIds.length > 0) {
               // Ajouter la condition pour filtrer par owner_id
               parameters.where = {
                   ...parameters.where,
                   owner_id: {
                       [Op.in]: userInstitutIds
                   }
               };
               
               // Ajouter la condition pour ne montrer que les tests parents
               // Les tests enfants seront récupérés séparément
               parameters.where = {
                   ...parameters.where,
                   parent_id: {
                       [Op.is]: null
                   }
               };
               
               console.log(`DEBUG - findAllTests - Filtrage par instituts: ${JSON.stringify(parameters.where)}`);
           } else if (isSystemAdmin) {
               console.log(`DEBUG - findAllTests - Administrateur système: aucun filtrage par institut`);
               
               // Si l'administrateur système ne veut pas voir les enfants, ajouter la condition
               if (!showChildren) {
                   parameters.where = {
                       ...parameters.where,
                       parent_id: {
                           [Op.is]: null
                       }
                   };
               }
           } else {
               console.log(`DEBUG - findAllTests - Utilisateur sans institut: aucun test ne sera retourné`);
               // Si l'utilisateur n'appartient à aucun institut et n'est pas admin système,
               // on retourne une liste vide
               return res.json({message: "0 test(s) found", tests: []});
           }

           // Parameter : INCLUDE
           parameters.include = [
               {
                   model: models['Level']
               },
               {
                   model: models['Test'],
                   as: 'parent', 
                   attributes: ["test_id", "label"]
               },
               {
                   model: models['Institut'],
                   as: 'owner',
                   attributes: ["institut_id", "label"]
               }
           ];
           
           // Si l'utilisateur est admin système et veut voir les enfants, inclure directement
           if (isSystemAdmin && showChildren) {
               parameters.include.unshift({
                   model: models['Test'],
                   as: 'child',
                   include: [{
                       model: models['Level']
                   }, {
                       model: models['Institut'],
                       as: 'owner',
                       attributes: ["institut_id", "label"]
                   }]
               });
               
               const Tests = await models['Test'].findAndCountAll(parameters);
               const message = `${Tests.count} test(s) found`;
               return res.json({message, tests: Tests.rows});
           } 
           // Sinon, récupérer les tests parents puis les enfants séparément
           else {
               // Récupérer d'abord les tests parents auxquels l'utilisateur a accès
               const Tests = await models['Test'].findAndCountAll(parameters);
               
               // Si l'utilisateur veut voir les enfants et qu'il y a des tests parents
               if (showChildren && Tests.count > 0) {
                   // Pour chaque test parent, récupérer ses enfants
                   const parentTestIds = Tests.rows.map(test => test.test_id);
                   console.log(`DEBUG - findAllTests - IDs des tests parents accessibles: ${parentTestIds.join(', ')}`);
                   
                   // Récupérer tous les tests enfants des tests parents accessibles
                   // IMPORTANT: Nous ne filtrons PAS par owner_id ici, car nous voulons tous les enfants
                   // des tests parents accessibles, quel que soit leur propriétaire
                   const childTests = await models['Test'].findAll({
                       where: {
                           parent_id: {
                               [Op.in]: parentTestIds
                           },
                           isArchive: parameters.where.isArchive
                       },
                       include: [
                           {
                               model: models['Level']
                           },
                           {
                               model: models['Institut'],
                               as: 'owner',
                               attributes: ["institut_id", "label"]
                           }
                       ]
                   });
                   
                   console.log(`DEBUG - findAllTests - Nombre de tests enfants trouvés: ${childTests.length}`);
                   
                   // Associer les tests enfants à leurs parents respectifs
                   const testsWithChildren = Tests.rows.map(parentTest => {
                       const children = childTests.filter(child => child.parent_id === parentTest.test_id);
                       const plainParent = parentTest.get({ plain: true });
                       plainParent.child = children.map(child => child.get({ plain: true }));
                       return plainParent;
                   });
                   
                   const message = `${Tests.count} test(s) found with ${childTests.length} child tests`;
                   return res.json({message, tests: testsWithChildren});
               } else {
                   // Si l'utilisateur ne veut pas voir les enfants ou s'il n'y a pas de tests parents
                   const message = `${Tests.count} test(s) found`;
                   return res.json({message, tests: Tests.rows});
               }
           }
       }
       catch (error){
           console.error('Erreur lors de la récupération des tests:', error);
           const message = `Service not available. Please retry later.`;
           res.status(500).json({message, data: error})
       }
    });
}