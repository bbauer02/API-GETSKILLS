const { models } = require('../models');
const { SYSTEM_ROLE_PERMISSIONS, INSTITUT_ROLE_PERMISSIONS } = require('./permissions/rolePermissions');

class PermissionService {
  // Vérifier si l'utilisateur a la permission requise
  static async hasPermission(userId, resource, action, resourceId = null) {
    try {
      // Récupérer l'utilisateur avec son rôle système
      const user = await models['User'].findByPk(userId, {
        include: [{
          model: models['Role'],
          as: 'systemRole'
        }]
      });
      
      if (!user) return false;
      
      // Vérifier les permissions du rôle système
      const systemRolePower = user.systemRole ? user.systemRole.power : 0;
      if (this.hasSystemPermission(systemRolePower, resource, action)) {
        return true;
      }
      
      // Si la ressource a un propriétaire (institut), vérifier les permissions d'institut
      if (resourceId && ['test', 'exam', 'level', 'skill'].includes(resource)) {
        const ownerId = await this.getResourceOwner(resource, resourceId);
        if (ownerId) {
          return await this.hasInstitutPermission(userId, ownerId, resource, action);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }
  
  // Vérifier si le rôle système a la permission requise
  static hasSystemPermission(power, resource, action) {
    const permissions = SYSTEM_ROLE_PERMISSIONS[power] || [];
    
    return permissions.some(permission => 
      permission === '*' || 
      permission === `${action}:*` || 
      permission === `*:${resource}` || 
      permission === `${action}:${resource}`
    );
  }
  
  // Vérifier si l'utilisateur a la permission requise dans l'institut
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
      
      if (!institutUser || !institutUser.Role) return false;
      
      const institutRolePower = institutUser.Role.power;
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
  
  // Déterminer l'institut propriétaire d'une ressource
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