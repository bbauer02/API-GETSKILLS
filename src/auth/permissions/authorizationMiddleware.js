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
    
    // Afficher les informations du token JWT pour le débogage
    console.log(`DEBUG - authorize - User ID: ${req.accessToken.user_id}`);
    console.log(`DEBUG - authorize - System Role: ${JSON.stringify(req.accessToken.systemRole || 'non défini')}`);
    
    if (req.accessToken.instituts && req.accessToken.instituts.length > 0) {
      console.log(`DEBUG - authorize - Instituts de l'utilisateur: ${JSON.stringify(req.accessToken.instituts)}`);
      
      // Afficher les détails des rôles dans les instituts
      req.accessToken.instituts.forEach(institut => {
        console.log(`DEBUG - authorize - Institut ${institut.institut_id}: Rôle=${institut.role}, Power=${institut.power}`);
      });
    } else {
      console.log(`DEBUG - authorize - L'utilisateur n'appartient à aucun institut!`);
    }
    
    // Si la ressource ou l'action n'est pas reconnue, refuser l'accès
    if (!resource || !action) {
      console.log(`DEBUG - authorize - Ressource ou action non reconnue`);
      return res.status(403).json({ message: "Accès non autorisé à cette ressource." });
    }
    
    // Récupérer l'ID de l'utilisateur à partir du token
    const userId = req.accessToken.user_id;
    
    // Ajouter les informations de contexte d'autorisation à la requête
    // pour permettre des vérifications supplémentaires dans les routes
    req.authContext = {
      userId: req.accessToken.user_id,
      userInstituts: req.accessToken.instituts || [],
      systemRole: req.accessToken.systemRole,
      resource,
      action,
      resourceId
    };
    
    console.log(`DEBUG - authorize - Contexte d'autorisation ajouté à la requête`);
    
    // Vérifier si l'utilisateur a la permission requise
    console.log(`DEBUG - authorize - Vérification des permissions pour user=${userId}, resource=${resource}, action=${action}`);
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