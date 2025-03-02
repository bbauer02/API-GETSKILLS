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
      
      // Vérifier les permissions du rôle système
      const systemRolePower = user.systemRole ? user.systemRole.power : 0;
      console.log(`DEBUG - PermissionService - Rôle système: power=${systemRolePower}`);
      
      if (this.hasSystemPermission(systemRolePower, resource, action)) {
        console.log(`DEBUG - PermissionService - Permission accordée par le rôle système`);
        return true;
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
}

module.exports = PermissionService; 