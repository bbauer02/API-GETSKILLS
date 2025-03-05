/**
 * Script de test pour vérifier les permissions utilisateur
 * À exécuter avec : node test-permission.js [userId] [testId]
 */
const PermissionService = require('./src/auth/permissions/permissionService');
const { models } = require('./src/models');

// Fonctions utilitaires pour afficher des informations
async function displayUserInfo(userId) {
  try {
    // Récupérer l'utilisateur avec son rôle système
    const user = await models['User'].findByPk(userId, {
      include: [{
        model: models['Role'],
        as: 'systemRole'
      }]
    });
    
    if (!user) {
      console.log(`❌ Utilisateur avec ID=${userId} non trouvé dans la base de données`);
      return null;
    }
    
    console.log('📋 INFORMATIONS UTILISATEUR:');
    console.log(`ID: ${userId}`);
    console.log(`Email: ${user.email}`);
    console.log(`Rôle système: ${user.systemRole ? user.systemRole.label : 'Non défini'} (power=${user.systemRole ? user.systemRole.power : 'N/A'})`);
    
    // Récupérer les instituts de l'utilisateur
    const userInstituts = await models['institutHasUser'].findAll({
      where: { user_id: userId },
      include: [{ model: models['Role'] }, { model: models['Institut'] }]
    });
    
    console.log(`\n🏢 INSTITUTS (${userInstituts.length}):`);
    userInstituts.forEach(institut => {
      console.log(`- ${institut.Institut.label} (ID=${institut.institut_id})`);
      console.log(`  Rôle: ${institut.Role.label} (power=${institut.Role.power})`);
    });
    
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return null;
  }
}

async function testPermission(userId, resource, action, resourceId = null) {
  try {
    console.log(`\n🔐 TEST PERMISSION: ${action} ${resource}${resourceId ? ` (ID=${resourceId})` : ''}`);
    
    const hasPermission = await PermissionService.hasPermission(userId, resource, action, resourceId);
    
    if (hasPermission) {
      console.log(`✅ L'utilisateur ${userId} A LA PERMISSION pour ${action} ${resource}`);
    } else {
      console.log(`❌ L'utilisateur ${userId} N'A PAS LA PERMISSION pour ${action} ${resource}`);
    }
    
    return hasPermission;
  } catch (error) {
    console.error('Erreur lors du test de permission:', error);
    return false;
  }
}

async function testExamCreation(userId, testId) {
  try {
    console.log(`\n🧪 TEST CRÉATION EXAMEN pour test_id=${testId}`);
    
    // Test des permissions générales
    const hasGenericPermission = await testPermission(userId, 'exam', 'create');
    
    // Test des permissions spécifiques pour ce test
    console.log(`\n🎯 TEST PERMISSION SPÉCIFIQUE pour test_id=${testId}`);
    const canCreateForTest = await PermissionService.canCreateResourceForTest(userId, testId, 'exam');
    
    if (canCreateForTest) {
      console.log(`✅ L'utilisateur ${userId} PEUT créer un examen pour le test ${testId}`);
    } else {
      console.log(`❌ L'utilisateur ${userId} NE PEUT PAS créer un examen pour le test ${testId}`);
    }
    
    // Récupérer le test pour voir son propriétaire
    const test = await models['Test'].findByPk(testId);
    console.log(`📋 INFORMATIONS TEST:`);
    
    if (test) {
      console.log(`ID: ${test.test_id}`);
      console.log(`Label: ${test.label}`);
      console.log(`Propriétaire (Institut ID): ${test.owner_id}`);
      
      // Vérifier si l'utilisateur appartient à l'institut propriétaire
      const userInstituts = await models['institutHasUser'].findAll({
        where: { user_id: userId },
        include: [{ model: models['Role'] }]
      });
      
      const belongsToOwner = userInstituts.some(institut => institut.institut_id === test.owner_id);
      console.log(`👥 L'utilisateur appartient à l'institut propriétaire: ${belongsToOwner ? 'OUI' : 'NON'}`);
      
      // Si oui, vérifier son rôle
      if (belongsToOwner) {
        const institutUser = userInstituts.find(institut => institut.institut_id === test.owner_id);
        console.log(`🔑 Rôle dans l'institut propriétaire: ${institutUser.Role.label} (power=${institutUser.Role.power})`);
      }
    } else {
      console.log(`❌ Test avec ID=${testId} non trouvé dans la base de données`);
    }
  } catch (error) {
    console.error('Erreur lors du test de création d\'examen:', error);
  }
}

// Fonction principale
async function main() {
  try {
    const userId = process.argv[2];
    const testId = process.argv[3];
    
    if (!userId) {
      console.error('Veuillez spécifier un ID utilisateur. Usage: node test-permission.js [userId] [testId]');
      process.exit(1);
    }
    
    console.log('=================================================');
    console.log('📊 DIAGNOSTIC DE PERMISSIONS UTILISATEUR');
    console.log('=================================================\n');
    
    await displayUserInfo(userId);
    
    // Tester les permissions générales
    await testPermission(userId, 'exam', 'create');
    
    // Si un test_id est fourni, tester les permissions spécifiques
    if (testId) {
      await testExamCreation(userId, testId);
    }
    
    console.log('\n=================================================');
    console.log('FIN DU DIAGNOSTIC');
    console.log('=================================================');
    
    // Fermer la connexion à la base de données
    await models.sequelize.close();
  } catch (error) {
    console.error('Erreur dans le script de test:', error);
  }
}

// Exécuter le script
main(); 