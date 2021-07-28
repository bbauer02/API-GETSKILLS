const jwt = require('jsonwebtoken');
const ENV = require('dotenv').config().parsed;
const {models} = require('../models');
const { token: config, power} = require('../config');
const crypto = require('crypto');



module.exports = {
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
            req.accessToken = decodedToken;
            return next();
        }
        catch(error) {
            res.status(401).json({"error" :error.message });
        }
    },
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized:  async (req, res, next) => {
        try {
          const decodedToken  =req.accessToken;
            // points d'entrées : sans les id
            const entriesPoints = req.url.split('/').filter(e => e !== 'api' && !parseInt(e)  && e !== '' );
            const ids = req.url.split('/').filter(e => e !== 'api' && parseInt(e)  && e !== '' );

            // Lecture du fichier de configuration des pouvoirs dynamiquement.
            const httpMethod = req.method.toUpperCase();
            let powerNeed = power[httpMethod];
            for(const entry of entriesPoints) {
                
                // Il y a toujours un point d'entrée au minimum. Donc si il n'y a que un seul point d'entrée, on se branche sur le "default"
                if(entriesPoints.length ===1) {
                    powerNeed =powerNeed[entry.split('?')[0]]["default"];
                }
                else {
                    powerNeed =powerNeed[entry.split('?')[0]];
                }
            }   
            // On vérifie les droits de l'utilisateur
            let userMemberOfInstitut = null;
            const moduleName = entriesPoints[0];
            let userPower = 0;

            if( moduleName === 'instituts' ) {
                const reqInstitut_id = req.params.institut_id || req.body.institut_id || null;
                
                if(reqInstitut_id) {
                    userMemberOfInstitut = decodedToken.instituts.find(({institut_id}) => institut_id === parseInt(reqInstitut_id) );
                    userMemberOfInstitut !== undefined && userMemberOfInstitut !== null ? userPower = userMemberOfInstitut.Role.power : -1;
                }
            }

            if(moduleName === 'skills') {
                userPower = decodedToken.systemRole.power;
            }

            if(userPower >= powerNeed) {
                return next();
            }
            else if (decodedToken.systemRole.power >= 10 ) {
                return next();
            }
            throw new Error(`You have no power here !`);
        }
        catch(error) {
            res.status(401).json({"error" :error.message });
        }
  
          
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
