const PermissionService = require('./permissionService');
const { extractResourceAndAction } = require('./routeMapping');

/**
 * Middleware d'autorisation qui vérifie si l'utilisateur a les permissions nécessaires
 * pour effectuer l'action demandée sur la ressource spécifiée
 * @param {Object} req - L'objet requête Express
 * @param {Object} res - L'objet réponse Express
 * @param {Function} next - La fonction next d'Express
 */
const authorize = async (req, res, next) => {
  try {
    // Extraire la ressource et l'action de la requête
    const { resource, action, resourceId } = extractResourceAndAction(req);
    
    console.log(`DEBUG - authorize - Requête: ${req.method} ${req.path}`);
    console.log(`DEBUG - authorize - Ressource: ${resource}, Action: ${action}, ResourceId: ${resourceId}`);
    
    // Si la ressource ou l'action n'est pas reconnue, refuser l'accès
    if (!resource || !action) {
      console.log(`DEBUG - authorize - Ressource ou action non reconnue`);
      return res.status(403).json({ message: "Accès non autorisé à cette ressource." });
    }
    
    // Récupérer l'ID de l'utilisateur à partir du token
    const userId = req.accessToken.user_id;
    
    // Vérifier si l'utilisateur a la permission requise
    const hasPermission = await PermissionService.hasPermission(userId, resource, action, resourceId);
    
    if (hasPermission) {
      console.log(`DEBUG - authorize - Permission accordée: ${action} ${resource}`);
      return next();
    }
    
    console.log(`DEBUG - authorize - Permission refusée: ${action} ${resource}`);
    return res.status(403).json({ message: "Vous n'avez pas les droits nécessaires pour cette action." });
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    return res.status(500).json({ message: "Une erreur est survenue lors de la vérification des autorisations." });
  }
};

module.exports = { authorize }; 