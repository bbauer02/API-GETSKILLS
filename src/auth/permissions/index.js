const { RESOURCES, ACTIONS } = require('./constants');
const { extractResourceAndAction } = require('./routeMapping');
const PermissionService = require('./permissionService');
const { authorize } = require('./authorizationMiddleware');

// Vérification que authorize est bien importé
console.log('DEBUG - authorize middleware:', authorize);

/**
 * Exporte tous les modules du système de permissions
 * Cela permet d'importer facilement les différentes parties du système
 * depuis d'autres fichiers de l'application
 */
module.exports = {
  // Constantes
  RESOURCES,
  ACTIONS,
  
  // Fonctions utilitaires
  extractResourceAndAction,
  
  // Service de permissions
  PermissionService,
  
  // Middleware d'autorisation
  authorize
}; 