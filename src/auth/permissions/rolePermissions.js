const { RESOURCES, ACTIONS } = require('./constants');

/**
 * Génère toutes les permissions CRUD pour une ressource donnée
 * @param {string} resource - La ressource pour laquelle générer les permissions
 * @returns {Array} Un tableau de permissions au format 'action:resource'
 */
const allPermissionsFor = (resource) => [
  `${ACTIONS.CREATE}:${resource}`,
  `${ACTIONS.READ}:${resource}`,
  `${ACTIONS.UPDATE}:${resource}`,
  `${ACTIONS.DELETE}:${resource}`
];

/**
 * Génère uniquement les permissions de lecture pour une ressource donnée
 * @param {string} resource - La ressource pour laquelle générer les permissions
 * @returns {Array} Un tableau contenant la permission de lecture
 */
const readPermissionFor = (resource) => [
  `${ACTIONS.READ}:${resource}`
];

/**
 * Permissions pour les rôles système
 * Les clés correspondent aux niveaux de pouvoir (power) des rôles
 */
const SYSTEM_ROLE_PERMISSIONS = {
  // Admin système (power 10)
  10: ['*'], // Accès à tout
  
  // User système (power 1)
  1: [
    ...readPermissionFor(RESOURCES.TEST),
    ...readPermissionFor(RESOURCES.EXAM),
    ...readPermissionFor(RESOURCES.LEVEL),
    ...readPermissionFor(RESOURCES.SKILL),
    ...readPermissionFor(RESOURCES.COUNTRY),
    ...readPermissionFor(RESOURCES.LANGUAGE),
    ...readPermissionFor(RESOURCES.ROLE)
  ]
};

/**
 * Permissions pour les rôles d'institut
 * Les clés correspondent aux niveaux de pouvoir (power) des rôles
 */
const INSTITUT_ROLE_PERMISSIONS = {
  // Admin institut (power 4)
  4: [
    ...allPermissionsFor(RESOURCES.USER),
    ...allPermissionsFor(RESOURCES.SESSION),
    ...allPermissionsFor(RESOURCES.TEST),
    ...allPermissionsFor(RESOURCES.EXAM),
    ...allPermissionsFor(RESOURCES.LEVEL),
    ...allPermissionsFor(RESOURCES.SKILL),
    ...allPermissionsFor(RESOURCES.DOCUMENT),
    ...allPermissionsFor(RESOURCES.INVOICE),
    `${ACTIONS.ARCHIVE}:${RESOURCES.TEST}`,
    `${ACTIONS.EXPORT}:${RESOURCES.TEST}`
  ],
  
  // Examinateur (power 3)
  3: [
    ...allPermissionsFor(RESOURCES.TEST),
    ...allPermissionsFor(RESOURCES.EXAM),
    ...allPermissionsFor(RESOURCES.LEVEL),
    ...allPermissionsFor(RESOURCES.SKILL),
    ...readPermissionFor(RESOURCES.USER),
    ...readPermissionFor(RESOURCES.SESSION),
    ...readPermissionFor(RESOURCES.DOCUMENT),
    `${ACTIONS.ARCHIVE}:${RESOURCES.TEST}`,
    `${ACTIONS.EXPORT}:${RESOURCES.TEST}`
  ],
  
  // Membre institut (power 2)
  2: [
    ...readPermissionFor(RESOURCES.TEST),
    ...readPermissionFor(RESOURCES.EXAM),
    ...readPermissionFor(RESOURCES.LEVEL),
    ...readPermissionFor(RESOURCES.SKILL),
    ...readPermissionFor(RESOURCES.SESSION)
  ],
  
  // Étudiant (power 1)
  1: [
    ...readPermissionFor(RESOURCES.TEST),
    ...readPermissionFor(RESOURCES.EXAM),
    ...readPermissionFor(RESOURCES.LEVEL),
    ...readPermissionFor(RESOURCES.SKILL)
  ]
};

module.exports = { SYSTEM_ROLE_PERMISSIONS, INSTITUT_ROLE_PERMISSIONS }; 