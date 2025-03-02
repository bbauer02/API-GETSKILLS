const jwt = require('jsonwebtoken');
const ENV = require('dotenv').config().parsed;
const { models } = require('../models');
const { power } = require('../config');
const config = require('../../config.prod');
const crypto = require('crypto');
const { cp } = require('fs');



module.exports = {
    // Generer un Token
    generateTokenForUser: async (userData) => {
        /* On créer le token CSRF */
        const now = Math.floor(Date.now() / 1000);

        const accessToken = jwt.sign({
            user_id: userData.user_id,
            instituts: userData.instituts,
            systemRole: userData.systemRole,
            type: 'access',
        },
        config.jw.accessToken.secret,
        {
            algorithm: config.jw.accessToken.algorithm,
            audience: config.jw.accessToken.audience,
            expiresIn: config.jw.accessToken.expiresIn / 1000,
            issuer: config.jw.accessToken.issuer,
            subject: userData.user_id.toString(),
            jwtid: crypto.randomBytes(16).toString('hex'), // unique JWT ID
        });

        const refreshToken = jwt.sign({
            user_id: userData.user_id,
            instituts: userData.instituts,
            systemRole: userData.systemRole,
            type: 'refresh',
        },
        config.jw.refreshToken.secret,
        {
            algorithm: config.jw.refreshToken.algorithm,
            audience: config.jw.refreshToken.audience,
            expiresIn: config.jw.refreshToken.expiresIn / 1000,
            issuer: config.jw.refreshToken.issuer,
            subject: userData.user_id.toString(),
            jwtid: crypto.randomBytes(16).toString('hex'), // unique JWT ID
        });


        const expiresAt = Date.now() + config.jw.refreshToken.expiresIn;

        await models['RefreshToken'].create({
            userId: userData.user_id,
            token: refreshToken,
            expiresAt : new Date(expiresAt)
        });


        return { accessToken, refreshToken };
    },
    getHeaderToken: (req) => {
        return new Promise(async (resolve, reject) => {

            try {
                // Vérifier présence du header Authorization
                const authHeader = req.headers['authorization'];
                if (!authHeader) {
                    return reject(new Error('Authorization header missing.'));
                }
                 // Vérifier format Bearer
                 if (!authHeader.startsWith('Bearer ')) {
                    return reject(new Error('Invalid token format. Must be Bearer token.'));
                 }

                const bearerToken = authHeader.substring(7);
                if (!bearerToken) {
                    return reject(new Error('Token is empty.'));
                }
                try {
                    const decodedToken = await jwt.verify(
                        bearerToken, 
                        config.jw.accessToken.secret,
                        {
                            algorithms: [config.jw.accessToken.algorithm],
                            issuer: config.jw.accessToken.issuer,
                            audience: config.jw.accessToken.audience
                        }
                    );
                    // Vérifications supplémentaires du token
                    if (!decodedToken.sub) {
                        return reject(new Error('Invalid token structure: missing subject.'));
                    }

                    return resolve(decodedToken);
                } catch (error) {
                    console.log('Erreur détaillée:', error);
                    throw error;
                }

               
            }
            catch (error) {
                reject(new Error('Invalid Token. Perhaps it was modified or expired.'));
            }

        });

    },
    // Fonction qui vérifie si l'utilisateur est identifié, 
    isAuthenticated: async (req, res, next) => {
        try {
            console.log('DEBUG - isAuthenticated - Vérification du token');
            const decodedToken = await module.exports.getHeaderToken(req);
            console.log('DEBUG - isAuthenticated - Token décodé:', JSON.stringify(decodedToken, null, 2));
            
            // 4. On vérifie que l'utilisateur existe bien dans notre base de données.
            const userId = decodedToken.sub;
            console.log('DEBUG - isAuthenticated - userId:', userId);
            
            const user = await models['User'].findOne({ where: { user_id: userId } });
            if (!user) {
                console.log('DEBUG - isAuthenticated - Utilisateur non trouvé');
                throw new Error(`User ${userId} not exists.`);
            }
            console.log('DEBUG - isAuthenticated - Utilisateur trouvé:', JSON.stringify(user, null, 2));
            
            // 5. On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares
            req.accessToken = decodedToken;
            return next();
        }
        catch (error) {
            console.log('DEBUG - isAuthenticated - Erreur:', error);
            res.status(401).json({ "error": error.message });
        }
    },
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized: async (req, res, next) => {
        try {
            console.log('DEBUG - isAuthorized - Vérification des droits');
            
            // On obtient la METHODE HTTP utilisé par la requête
            const httpMethod = req.method.toUpperCase();
            console.log('DEBUG - isAuthorized - Méthode HTTP:', httpMethod);
            
            // A partit de la method HTTP nous faisons un premier filtre sur l'objet POWER
            // quine retournera que les pouvoir de la méthode HTTP voulue.
            let powerNeedByHttpMethod = power[httpMethod];
            console.log('DEBUG - isAuthorized - powerNeedByHttpMethod:', JSON.stringify(powerNeedByHttpMethod, null, 2));
            
            // On récupére également le TOKEN.
            const decodedToken = req.accessToken;
            console.log('DEBUG - isAuthorized - decodedToken:', JSON.stringify(decodedToken, null, 2));
            
            // On détermine maintenant le pouvoir nécéssaire à la lecture de cette route : 
            // On récupére un tableau des différents points d'entrées qui composent l'URL.
            const filteredURL = req.url.split('?')[0];
            console.log('DEBUG - isAuthorized - filteredURL:', filteredURL);
            
            const entriesPoints = filteredURL.split('/').filter(segment => {
                const isNotApi = segment !== 'api';
                const isNotEmpty = segment !== '';
                const isNotNumber = isNaN(segment);               
                return (isNotApi && isNotEmpty && isNotNumber);
            });
            console.log('DEBUG - isAuthorized - entriesPoints:', entriesPoints);
              
            // moduleName ici avant qu'il ne devienne un tableau vide ? (voir console.log plus bas avant le moduleName === 'institut')
            const moduleName = entriesPoints[0];
            console.log('DEBUG - isAuthorized - moduleName:', moduleName);
            
            // On récupére les 'ids' de l'URL si il y en a. 
            const ids = req.url.split('/').filter(e => e !== 'api' && parseInt(e) && e !== '');
            console.log('DEBUG - isAuthorized - ids:', ids);
            
            // on fixe un pouvoir par default à 0 en cas d'oublie de définition des pouvoirs d'une route. 
            // en fixant à 10 , la route est protégée. 
            // Toutefois, la valeur 'default' d'un noeud parent écrasera toujours 'defaultPowerNeeded'
            const defaultPowerNeeded = 10;
            
            // On obtient le pouvoir nécessaire à la lecture de cette route.
            const powerNeed = module.exports.getPowerNeed(powerNeedByHttpMethod, entriesPoints, defaultPowerNeeded);
            console.log('DEBUG - isAuthorized - powerNeed:', powerNeed);
            
            // On vérifie les droits de l'utilisateur
            // Si le premier point d'entrée de l'API est INSTITUTS, il faut s'assurer que l'utilisateur qui a l'accès à cette route : 
            // 1 = soit membre de l'institut et possède les droits pour cette route dans cette institut.
            let userMemberOfInstitut = null;
            let userPower = 0;
            
            // console.log("\n\nentriesPoints==", entriesPoints,"\n\n");
            if (moduleName === 'instituts') {
                // On récupére l'identifiant de l'institut concerné : dans l'uRL, ou dans le body .
                const reqInstitut_id = req.params.institut_id || req.body.institut_id || req.query.institut_id || null;
                console.log('DEBUG - isAuthorized - reqInstitut_id:', reqInstitut_id);
              
                if (reqInstitut_id) {
                    // on cherche dans le token de connexion l'objet relatif à l'identifiant de l'institut concerné. 
                    userMemberOfInstitut = decodedToken.instituts.find(({ institut_id }) => institut_id === parseInt(reqInstitut_id));
                    console.log('DEBUG - isAuthorized - userMemberOfInstitut:', JSON.stringify(userMemberOfInstitut, null, 2));

                    // on récupére le userPower
                    userMemberOfInstitut !== undefined && userMemberOfInstitut !== null ? userPower = userMemberOfInstitut.Role.power : -1;
                    console.log('DEBUG - isAuthorized - userPower:', userPower);
                }
            }
            if(moduleName === 'users') {
                const response = await models['institutHasUser'].findOne({ where: { user_id: ids[0] } });
                console.log('DEBUG - isAuthorized - response users:', JSON.stringify(response, null, 2));
                
                if (!response) {
                    throw new Error(`User ${ids[0]} not exists.`);
                }
                const userToUpdateInstitut =  response.dataValues.institut_id;
                const currentUserInstitut = decodedToken.instituts[0].institut_id;
                console.log('DEBUG - isAuthorized - userToUpdateInstitut:', userToUpdateInstitut);
                console.log('DEBUG - isAuthorized - currentUserInstitut:', currentUserInstitut);

                // On verifie si celui qui fait l'update de l'utilisateur est membre de l'institut du user modifié
                if(httpMethod ==="PUT" && userToUpdateInstitut === currentUserInstitut && decodedToken.instituts[0].Role.power >= power["PUT"]["instituts"]["sessions"]["users"]) {
                    console.log('DEBUG - isAuthorized - Utilisateur autorisé (PUT users)');
                    return next();
                }
                if(httpMethod ==="PUT" && decodedToken.user_id === parseInt(ids[0],10) ) {
                    console.log('DEBUG - isAuthorized - Utilisateur autorisé (PUT self)');
                    if(req.body.systemRole_id) {
                        delete req.body.systemRole_id;
                    }  
                    return next();
                }
            }
            
            // Cas spécial pour les examens, skills, levels et tests
            // Ces ressources sont gérées par le middleware checkTestOwnerPermission
            if (['exams', 'skills', 'levels', 'tests'].includes(moduleName)) {
                console.log('DEBUG - isAuthorized - Ressource gérée par checkTestOwnerPermission, autorisation accordée');
                return next();
            }
            
            if (userPower >= powerNeed) {
                console.log('DEBUG - isAuthorized - Utilisateur autorisé (userPower >= powerNeed)');
                return next();
            }
            else if (decodedToken.systemRole.power && decodedToken.systemRole.power >= powerNeed) {
                console.log('DEBUG - isAuthorized - Utilisateur autorisé (systemRole.power >= powerNeed)');
                return next();
            }
            
            console.log('DEBUG - isAuthorized - Utilisateur non autorisé');
            throw new Error(`You have no power here !`);
        }
        catch (error) {
            console.log('DEBUG - isAuthorized - Erreur:', error);
            res.status(401).json({ "error": error.message });
        }
    },
    hasPowerEnough: (systemRole, powerNeeded) => {
        if (systemRole && systemRole.power >= powerNeeded) {
            return true;
        }
        else {
            return false;
        }
    },
    getPowerNeed(objPower, entries, defaultPowerNeeded) {
        // On extrait le premier élément de la route et on le retire.
        const firstEntry = entries.shift();
        // Object.keys to list all properties in raw (the original data), then
        // Array.prototype.filter to select keys that are present in the allowed list, using
        // Array.prototype.includes to make sure they are present
        // Array.prototype.reduce to build a new object with only the allowed properties.
        const filtered = Object.keys(objPower)
        .filter(key => key === firstEntry)
        .reduce((obj, key) => {
            obj[key] = objPower[key];
            if(objPower[key].default) {
                defaultPowerNeeded = objPower[key].default;
            }
            return obj;
        }, {})[firstEntry];
        if(!entries.length) {
            if(typeof filtered === 'object') {
                if(filtered.hasOwnProperty('default')) {
                    return filtered.default;
                }
                else {
                    return defaultPowerNeeded;
                }
            }
            else return filtered;
        }
        return module.exports.getPowerNeed(filtered,entries, defaultPowerNeeded);


        /*/// SOLUTION 2
            const getPath = ([p, ...ps]) => (o) =>
            p == undefined ? o : getPath (ps) (o && o[p])
            const getPower_version2 = (path, obj, node = getPath (path) (obj)) =>
            Object (node) === node && 'default' in node ? node .default : node
        */
    }

}