const jwt = require('jsonwebtoken');
const ENV = require('dotenv').config().parsed;
const {models} = require('../models');
const { token: config } = require('../config');
const crypto = require('crypto');


module.exports = {
    // Niveau de droit par "modules"
    modulePower : {
        PUT : {
            instituts : ENV.INSTITUTS_UPDATE,
            sessions : ENV.SESSIONS_UPDATE
        },
        DELETE : {
            instituts : ENV.INSTITUTS_DELETE,
            sessions : ENV.SESSIONS_DELETE
        }
    },
    // Generer un Token
    generateTokenForUser: async (userData) => {
        /* On créer le token CSRF */
        const xsrfToken = crypto.randomBytes(64).toString('hex');

        const accessToken =  jwt.sign({
           user_id: userData.user_id,
           instituts : userData.instituts,
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
    getHeaderToken :  (req) => {
        return new Promise(async (resolve,reject) => {

            try {
                const {cookies, headers} = req;
                console.log(req)
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
            catch(error) {
                reject(new Error('Invalid Token. Perhaps it was modified or expired.'));
            }
            
        });
        
    },
    // Fonction qui vérifie si l'utilisateur est identifié, 
    isAuthenticated : async (req, res, next) => {
        try {
            const decodedToken = await module.exports.getHeaderToken(req);
            // 4. On vérifie que l'utilisateur existe bien dans notre base de données.
            const userId = decodedToken.sub;
            const user = await models['User'].findOne({ where: { user_id: userId}});
            if(!user) {
                throw new Error(`User ${userId} not exists.`); 
            }
            // 5. On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares
            req.user = user;
            return next();
        }
        catch(error) {
            res.status(401).json({"error" :error.message });
        }
    },
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized:  async (req, res, next) => {
        return next();
           
           /*     const moduleName = req.url.split('/')[2];
                const httpMethod = req.method;
                const powerNeeded = module.exports.modulePower[httpMethod][moduleName];
                let userMemberOfInstitut = null;

                if( (moduleName === 'instituts' && req.params.id) || (moduleName === 'Sessions' && req.body.institut_id)) {
                    const reqInstitut_id = req.params.id || req.body.institut_id;
                    userMemberOfInstitut = decodedToken.instituts.find(({institut_id}) => institut_id === parseInt(reqInstitut_id) );
                }

                if( userMemberOfInstitut && userMemberOfInstitut.Role.power >= powerNeeded) {
                    next();
                }
                else if (module.exports.hasPowerEnough(decodedToken.systemRole, powerNeeded)) {
                    next();
                }
                else {
                   throw new Error('Not granted any authorities'); 
                }*/
           
    },
    hasPowerEnough : (systemRole, powerNeeded) => {
        if(systemRole && systemRole.power >= powerNeeded ) {
            return true;
        }
        else {
            return false;
        }
    },
}