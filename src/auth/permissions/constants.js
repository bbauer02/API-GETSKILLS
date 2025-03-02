/**
 * Définition des ressources de l'application
 * Ces constantes représentent les différentes entités qui peuvent être manipulées
 */
const RESOURCES = {
  TEST: 'test',
  EXAM: 'exam',
  LEVEL: 'level',
  SKILL: 'skill',
  SESSION: 'session',
  INSTITUT: 'institut',
  USER: 'user',
  DOCUMENT: 'document',
  INVOICE: 'invoice',
  COUNTRY: 'country',
  ROLE: 'role',
  LANGUAGE: 'language'
};

/**
 * Définition des actions possibles sur les ressources
 * Ces constantes représentent les opérations CRUD et autres actions spécifiques
 */
const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  ARCHIVE: 'archive',
  EXPORT: 'export',
  IMPORT: 'import'
};

module.exports = { RESOURCES, ACTIONS }; 