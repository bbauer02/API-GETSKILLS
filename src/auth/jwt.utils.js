const jwt = require('jsonwebtoken');
const ENV = require('dotenv').config().parsed;
const { models } = require('../models');
const { token: config, power } = require('../config');
const crypto = require('crypto');



module.exports = {
    // Generer un Token
    generateTokenForUser: async (userData) => {
        /* On créer le token CSRF */
        const xsrfToken = crypto.randomBytes(64).toString('hex');

        const accessToken = jwt.sign({
            user_id: userData.user_id,
            instituts: userData.instituts,
            systemRole: userData.systemRole,
            xsrfToken
        },
            config.accessToken.secret,
            {
                algorithm: config.accessToken.algorithm,
                audience: config.accessToken.audience,
                expiresIn: config.accessToken.expiresIn / 1000,
                issuer: config.accessToken.issuer,
                subject: userData.user_id.toString()
            });
        const refreshToken = crypto.randomBytes(128).toString('base64');

        await models['RefreshToken'].create({
            userId: userData.user_id,
            token: refreshToken,
            expiresAt: Date.now() + config.refreshToken.expiresIn
        });



        return { accessToken, refreshToken, xsrfToken };
    },
    getHeaderToken: (req) => {
        return new Promise(async (resolve, reject) => {

            try {
                const { cookies, headers } = req;
                /* On vérifie que le JWT est présent dans les cookies de la requête */
                if (!cookies || !cookies.access_token) {
                    reject(new Error('Missing token in cookie'));
                }
                const accessToken = cookies.access_token;
                /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
                if (!headers || !headers['x-xsrf-token']) {
                    reject(new Error('Missing XSRF token in headers'));
                }
                const xsrfToken = headers['x-xsrf-token'];
                // On vérifie et décode le token à l'aide du secret et de l'algorithme utilisé pour le générer
                const decodedToken = await jwt.verify(accessToken, config.accessToken.secret, {
                    algorithms: config.accessToken.algorithm
                });
                /* On vérifie que le token CSRF correspond à celui présent dans le JWT  */
                if (xsrfToken !== decodedToken.xsrfToken) {
                    reject(new Error('Bad xsrf token'));
                }
                resolve(decodedToken);
            }
            catch (error) {
                reject(new Error('Invalid Token. Perhaps it was modified or expired.'));
            }

        });

    },
    // Fonction qui vérifie si l'utilisateur est identifié, 
    isAuthenticated: async (req, res, next) => {
        try {
            const decodedToken = await module.exports.getHeaderToken(req);
            // 4. On vérifie que l'utilisateur existe bien dans notre base de données.
            const userId = decodedToken.sub;
            const user = await models['User'].findOne({ where: { user_id: userId } });
            if (!user) {
                throw new Error(`User ${userId} not exists.`);
            }
            // 5. On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares
            req.accessToken = decodedToken;
            return next();
        }
        catch (error) {
            res.status(401).json({ "error": error.message });
        }
    },
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized: async (req, res, next) => {
        try {
            // On obtient la METHODE HTTP utilisé par la requête
            const httpMethod = req.method.toUpperCase();
            // A partit de la method HTTP nous faisons un premier filtre sur l'objet POWER
            // quine retournera que les pouvoir de la méthode HTTP voulue.
            let powerNeedByHttpMethod = power[httpMethod];
            // On récupére également le TOKEN.
            const decodedToken = req.accessToken;
            // On détermine maintenant le pouvoir nécéssaire à la lecture de cette route : 
            // On récupére un tableau des différents points d'entrées qui composent l'URL.
            const filteredURL = req.url.split('?')[0];
            console.log(filteredURL);
            const entriesPoints = filteredURL.split('/').filter(e => e !== 'api' && !parseInt(e) && e !== '');
            // On récupére les 'ids' de l'URL si il y en a. 
            const ids = req.url.split('/').filter(e => e !== 'api' && parseInt(e) && e !== '');
            // on fixe un pouvoir par default à 0 en cas d'oublie de définition des pouvoirs d'une route. 
            // en fixant à 10 , la route est protégée. 
            // Toutefois, la valeur 'default' d'un noeud parent écrasera toujours 'defaultPowerNeeded'
            const defaultPowerNeeded = 10;
            // On obtient le pouvoir nécessaire à la lecture de cette route.
            const powerNeed = module.exports.getPowerNeed(powerNeedByHttpMethod, entriesPoints, defaultPowerNeeded);
            // On vérifie les droits de l'utilisateur
            // Si le premier point d'entrée de l'API est INSTITUTS, il faut s'assurer que l'utilisateur qui a l'accès à cette route : 
            // 1 = soit membre de l'institut et possède les droits pour cette route dans cette institut.
            let userMemberOfInstitut = null;
            const moduleName = entriesPoints[0];
            let userPower = 0;
            if (moduleName === 'instituts') {
                // On récupére l'identifiant de l'institut concerné : dans l'uRL, ou dans le body .
                const reqInstitut_id = req.params.institut_id || req.body.institut_id || null;
                if (reqInstitut_id) {
                    // on cherche dans le token de connexion l'objet relatif à l'identifiant de l'institut concerné. 
                    userMemberOfInstitut = decodedToken.instituts.find(({ institut_id }) => institut_id === parseInt(reqInstitut_id));
                    // on récupére le userPower
                    userMemberOfInstitut !== undefined && userMemberOfInstitut !== null ? userPower = userMemberOfInstitut.Role.power : -1;
                }
            }

            console.log(userPower, powerNeed);
            if (userPower >= powerNeed) {
                return next();
            }
            else if (decodedToken.systemRole.power && decodedToken.systemRole.power >= powerNeed) {
                return next();
            }
            throw new Error(`You have no power here !`);
        }
        catch (error) {
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
            if(filtered.default) {
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