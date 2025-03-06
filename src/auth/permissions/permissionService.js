const { models } = require('../../models');
const { SYSTEM_ROLE_PERMISSIONS, INSTITUT_ROLE_PERMISSIONS } = require('./rolePermissions');

/**
 * Service de gestion des permissions
 * Fournit des méthodes pour vérifier si un utilisateur a les permissions nécessaires
 */
class PermissionService {
  /**
   * Vérifie si un utilisateur a la permission requise pour une action sur une ressource
   * @param {number} userId - L'ID de l'utilisateur
   * @param {string} resource - La ressource concernée
   * @param {string} action - L'action à effectuer
   * @param {number|null} resourceId - L'ID de la ressource (optionnel)
   * @returns {Promise<boolean>} True si l'utilisateur a la permission, false sinon
   */
  static async hasPermission(userId, resource, action, resourceId = null) {
    try {
      console.log(`DEBUG - PermissionService - Vérification des permissions pour user_id=${userId}, action=${action}, resource=${resource}, resourceId=${resourceId}`);
      
      // Récupérer l'utilisateur avec son rôle système
      const user = await models['User'].findByPk(userId, {
        include: [{
          model: models['Role'],
          as: 'systemRole'
        }]
      });
      
      if (!user) {
        console.log(`DEBUG - PermissionService - Utilisateur ${userId} non trouvé`);
        return false;
      }
      
      // Récupérer les instituts auxquels appartient l'utilisateur et leurs rôles
      const userInstituts = await models['institutHasUser'].findAll({
        where: { user_id: userId },
        include: [{ model: models['Role'] }, { model: models['Institut'] }]
      });
      
      console.log(`DEBUG - PermissionService - Utilisateur appartient à ${userInstituts.length} institut(s)`);
      userInstituts.forEach(institut => {
        console.log(`DEBUG - PermissionService - Institut: ${institut.Institut.label} (ID=${institut.institut_id}), Rôle: ${institut.Role.label} (power=${institut.Role.power})`);
      });
      
      // Vérifier les permissions du rôle système
      const systemRolePower = user.systemRole ? user.systemRole.power : 0;
      console.log(`DEBUG - PermissionService - Rôle système: power=${systemRolePower}`);
      
      // Vérifier si l'utilisateur a la permission via son rôle système
      const hasSystemPermission = this.hasSystemPermission(systemRolePower, resource, action);
      console.log(`DEBUG - PermissionService - Permission système: ${hasSystemPermission ? 'OUI' : 'NON'}`);
      
      if (hasSystemPermission) {
        console.log(`DEBUG - PermissionService - Permission accordée par le rôle système`);
        return true;
      }
      
      // Vérifier chaque institut de l'utilisateur
      console.log(`DEBUG - PermissionService - Vérification des permissions dans les instituts de l'utilisateur...`);
      
      // Cas spécial: création d'une nouvelle ressource (pas d'ID de ressource)
      if (!resourceId && action === 'create') {
        console.log(`DEBUG - PermissionService - Création d'une nouvelle ressource ${resource}`);
        
        // Pour les tests, examens, niveaux et compétences, il faut vérifier les permissions générales
        if (['exam', 'level', 'skill'].includes(resource)) {
          try {
            console.log(`DEBUG - PermissionService - Vérification des permissions générales pour créer ${resource}`);
            
            // Vérifier si l'utilisateur a les permissions nécessaires dans au moins un institut
            for (const institut of userInstituts) {
              const institutRolePower = institut.Role.power;
              const permissions = INSTITUT_ROLE_PERMISSIONS[institutRolePower] || [];
              
              console.log(`DEBUG - PermissionService - Vérification institut ${institut.institut_id} avec power=${institutRolePower}`);
              console.log(`DEBUG - PermissionService - Permissions disponibles: ${JSON.stringify(permissions)}`);
              
              const hasPermission = permissions.some(permission => 
                permission === '*' || 
                permission === `${action}:*` || 
                permission === `*:${resource}` || 
                permission === `${action}:${resource}`
              );
              
              console.log(`DEBUG - PermissionService - Institut ${institut.institut_id} a la permission? ${hasPermission}`);
              
              if (hasPermission) {
                console.log(`DEBUG - PermissionService - Permission accordée par le rôle dans l'institut ${institut.institut_id} (power=${institutRolePower})`);
                return true;
              }
            }
            
            console.log(`DEBUG - PermissionService - Aucune permission trouvée pour créer ${resource} dans les instituts de l'utilisateur`);
            return false;
          } catch (error) {
            console.error(`Erreur lors de la vérification des permissions pour créer ${resource}:`, error);
            return false;
          }
        }
        
        // Si aucun institut spécifique n'est requis, vérifier si l'utilisateur a le droit dans l'un de ses instituts
        for (const institut of userInstituts) {
          const institutRolePower = institut.Role.power;
          const permissions = INSTITUT_ROLE_PERMISSIONS[institutRolePower] || [];
          
          if (permissions.some(permission => 
            permission === '*' || 
            permission === `${action}:*` || 
            permission === `*:${resource}` || 
            permission === `${action}:${resource}`
          )) {
            console.log(`DEBUG - PermissionService - Permission accordée par le rôle dans l'institut ${institut.institut_id}`);
            return true;
          }
        }
      }
      
      // Si la ressource a un propriétaire (institut), vérifier les permissions d'institut
      if (resourceId && ['test', 'exam', 'level', 'skill'].includes(resource)) {
        const ownerId = await this.getResourceOwner(resource, resourceId);
        console.log(`DEBUG - PermissionService - Propriétaire de la ressource: institut_id=${ownerId}`);
        
        if (ownerId) {
          const hasInstitutPerm = await this.hasInstitutPermission(userId, ownerId, resource, action);
          console.log(`DEBUG - PermissionService - Permission institut: ${hasInstitutPerm}`);
          return hasInstitutPerm;
        }
      }
      
      // Cas spécial pour les ressources qui n'ont pas d'ID spécifique (comme la liste des sujets)
      if (!resourceId && ['subject'].includes(resource)) {
        console.log(`DEBUG - PermissionService - Vérification des permissions générales pour ${action} ${resource}`);
        
        // Vérifier si l'utilisateur a les permissions nécessaires dans au moins un institut
        for (const institut of userInstituts) {
          const institutRolePower = institut.Role.power;
          const permissions = INSTITUT_ROLE_PERMISSIONS[institutRolePower] || [];
          
          console.log(`DEBUG - PermissionService - Vérification institut ${institut.institut_id} avec power=${institutRolePower}`);
          console.log(`DEBUG - PermissionService - Permissions disponibles: ${JSON.stringify(permissions)}`);
          
          const hasPermission = permissions.some(permission => 
            permission === '*' || 
            permission === `${action}:*` || 
            permission === `*:${resource}` || 
            permission === `${action}:${resource}`
          );
          
          console.log(`DEBUG - PermissionService - Institut ${institut.institut_id} a la permission? ${hasPermission}`);
          
          if (hasPermission) {
            console.log(`DEBUG - PermissionService - Permission accordée par le rôle dans l'institut ${institut.institut_id} (power=${institutRolePower})`);
            return true;
          }
        }
      }
      
      console.log(`DEBUG - PermissionService - Permission refusée`);
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }
  
  /**
   * Vérifie si le rôle système a la permission requise
   * @param {number} power - Le niveau de pouvoir du rôle système
   * @param {string} resource - La ressource concernée
   * @param {string} action - L'action à effectuer
   * @returns {boolean} True si le rôle a la permission, false sinon
   */
  static hasSystemPermission(power, resource, action) {
    const permissions = SYSTEM_ROLE_PERMISSIONS[power] || [];
    
    return permissions.some(permission => 
      permission === '*' || 
      permission === `${action}:*` || 
      permission === `*:${resource}` || 
      permission === `${action}:${resource}`
    );
  }
  
  /**
   * Vérifie si l'utilisateur a la permission requise dans l'institut
   * @param {number} userId - L'ID de l'utilisateur
   * @param {number} institutId - L'ID de l'institut
   * @param {string} resource - La ressource concernée
   * @param {string} action - L'action à effectuer
   * @returns {Promise<boolean>} True si l'utilisateur a la permission, false sinon
   */
  static async hasInstitutPermission(userId, institutId, resource, action) {
    try {
      // Récupérer le rôle de l'utilisateur dans l'institut
      const institutUser = await models['institutHasUser'].findOne({
        where: {
          user_id: userId,
          institut_id: institutId
        },
        include: [{
          model: models['Role']
        }]
      });
      
      if (!institutUser || !institutUser.Role) {
        console.log(`DEBUG - PermissionService - Utilisateur ${userId} n'est pas membre de l'institut ${institutId}`);
        return false;
      }
      
      const institutRolePower = institutUser.Role.power;
      console.log(`DEBUG - PermissionService - Rôle institut: power=${institutRolePower}`);
      
      const permissions = INSTITUT_ROLE_PERMISSIONS[institutRolePower] || [];
      
      return permissions.some(permission => 
        permission === '*' || 
        permission === `${action}:*` || 
        permission === `*:${resource}` || 
        permission === `${action}:${resource}`
      );
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions d\'institut:', error);
      return false;
    }
  }
  
  /**
   * Détermine l'institut propriétaire d'une ressource
   * @param {string} resource - Le type de ressource
   * @param {number} resourceId - L'ID de la ressource
   * @returns {Promise<number|null>} L'ID de l'institut propriétaire ou null
   */
  static async getResourceOwner(resource, resourceId) {
    try {
      switch (resource) {
        case 'test':
          const test = await models['Test'].findByPk(resourceId);
          return test ? test.owner_id : null;
          
        case 'exam':
          const exam = await models['Exam'].findByPk(resourceId);
          if (!exam) return null;
          
          const testForExam = await models['Test'].findByPk(exam.test_id);
          return testForExam ? testForExam.owner_id : null;
          
        case 'level':
          const level = await models['Level'].findByPk(resourceId);
          if (!level) return null;
          
          const testForLevel = await models['Test'].findByPk(level.test_id);
          return testForLevel ? testForLevel.owner_id : null;
          
        case 'skill':
          const skill = await models['Skill'].findByPk(resourceId);
          if (!skill) return null;
          
          const testForSkill = await models['Test'].findByPk(skill.test_id);
          return testForSkill ? testForSkill.owner_id : null;
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Erreur lors de la détermination du propriétaire de la ressource:', error);
      return null;
    }
  }

  /**
   * Vérifie si un utilisateur peut créer une ressource liée à un test
   * @param {number} userId - L'ID de l'utilisateur
   * @param {number} testId - L'ID du test associé
   * @param {string} resource - Le type de ressource à créer
   * @returns {Promise<boolean>} True si l'utilisateur peut créer la ressource, false sinon
   */
  static async canCreateResourceForTest(userId, testId, resource) {
    try {
      console.log(`DEBUG - PermissionService - Vérification si l'utilisateur ${userId} peut créer ${resource} pour le test ${testId}`);
      
      // Récupérer le test pour identifier son propriétaire
      const test = await models['Test'].findByPk(testId);
      if (!test || !test.owner_id) {
        console.log(`DEBUG - PermissionService - Test ${testId} introuvable ou sans propriétaire`);
        return false;
      }
      
      console.log(`DEBUG - PermissionService - Test ${testId} appartient à l'institut ${test.owner_id}`);
      
      // Vérifier si l'utilisateur a les permissions dans cet institut
      const hasInstitutPerm = await this.hasInstitutPermission(userId, test.owner_id, resource, 'create');
      console.log(`DEBUG - PermissionService - Permission institut pour créer ${resource}: ${hasInstitutPerm}`);
      
      return hasInstitutPerm;
    } catch (error) {
      console.error(`Erreur lors de la vérification des permissions pour créer ${resource}:`, error);
      return false;
    }
  }
}

module.exports = PermissionService; 