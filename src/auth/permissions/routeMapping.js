const { RESOURCES, ACTIONS } = require('./constants');

/**
 * Mapping des méthodes HTTP vers les actions
 * Permet de déterminer automatiquement l'action à partir de la méthode HTTP
 */
const METHOD_TO_ACTION = {
  GET: ACTIONS.READ,
  POST: ACTIONS.CREATE,
  PUT: ACTIONS.UPDATE,
  PATCH: ACTIONS.UPDATE,
  DELETE: ACTIONS.DELETE
};

/**
 * Mapping des segments d'URL vers les ressources
 * Permet de déterminer automatiquement la ressource à partir de l'URL
 */
const URL_SEGMENT_TO_RESOURCE = {
  'tests': RESOURCES.TEST,
  'exams': RESOURCES.EXAM,
  'levels': RESOURCES.LEVEL,
  'skills': RESOURCES.SKILL,
  'sessions': RESOURCES.SESSION,
  'instituts': RESOURCES.INSTITUT,
  'users': RESOURCES.USER,
  'documents': RESOURCES.DOCUMENT,
  'invoices': RESOURCES.INVOICE,
  'countries': RESOURCES.COUNTRY,
  'roles': RESOURCES.ROLE,
  'languages': RESOURCES.LANGUAGE, 
  'subjects': RESOURCES.SUBJECT
};

/**
 * Cas spéciaux pour les routes qui ne suivent pas le modèle standard
 * Format: { 'méthode:chemin': { resource, action } }
 */
const SPECIAL_ROUTES = {
  'GET:/api/tests/variations': { resource: RESOURCES.TEST, action: ACTIONS.READ },
  'POST:/api/tests/archive': { resource: RESOURCES.TEST, action: ACTIONS.ARCHIVE },
  'GET:/api/csvItem/export': { resource: RESOURCES.TEST, action: ACTIONS.EXPORT },
  'POST:/api/subjects/generate': { resource: RESOURCES.SUBJECT, action: ACTIONS.CREATE }
  // Ajoutez d'autres cas spéciaux selon vos besoins
};

/**
 * Extrait la ressource et l'action d'une requête HTTP
 * @param {Object} req - L'objet requête Express
 * @returns {Object} Un objet contenant la ressource, l'action et l'ID de la ressource
 */
const extractResourceAndAction = (req) => {
  const method = req.method;
  const path = req.path;
  
  // Vérifier d'abord si c'est une route spéciale
  const specialRouteKey = `${method}:${path}`;
  if (SPECIAL_ROUTES[specialRouteKey]) {
    const { resource, action } = SPECIAL_ROUTES[specialRouteKey];
    return { resource, action, resourceId: null };
  }
  
  // Sinon, déterminer l'action à partir de la méthode HTTP
  const action = METHOD_TO_ACTION[method];
  
  // Extraire les segments de l'URL (après /api/)
  const segments = path.split('/').filter(segment => segment !== '' && segment !== 'api');
  
  if (segments.length === 0) {
    return { resource: null, action: null, resourceId: null };
  }
  
  // Le premier segment est généralement le nom de la ressource
  const mainSegment = segments[0];
  const resource = URL_SEGMENT_TO_RESOURCE[mainSegment];
  
  // Le deuxième segment est souvent l'ID de la ressource s'il s'agit d'un nombre
  let resourceId = null;
  if (segments.length > 1 && !isNaN(segments[1])) {
    resourceId = parseInt(segments[1]);
  }
  
  return { resource, action, resourceId };
};

module.exports = { extractResourceAndAction }; 