const jwt = require('jsonwebtoken');
const ENV = require('dotenv').config().parsed;
let JWT_SIGN_SECRET = ENV.JWT_SIGN_SECRET;

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
    generateTokenForUser: (userData) => {
        return jwt.sign({
            user_id: userData.user_id,
           instituts : userData.instituts,
           systemRole: userData.systemRole,

        },
        JWT_SIGN_SECRET, 
        {
            expiresIn: '1h'
        });

    },
    getHeaderToken : (req) => {
        return new Promise(async (resolve,reject) => {

            try {
                const authorizationHeader = req.headers.authorization;
                if(!authorizationHeader) { 
                    reject(new Error('Give an authentification Token before asking for the ressource'));
                } 
                const token = authorizationHeader.split(' ')[1];
                const decodedToken = await jwt.verify(token, JWT_SIGN_SECRET);
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
            await module.exports.getHeaderToken(req);
            next();
        }
        catch(error) {
            res.status(401).json({"message" : error.message});
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
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized:  async (req, res, next) => {
    
            try {
                const decodedToken = await module.exports.getHeaderToken(req);
                next();
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
            }
            catch(error) {
                res.status(401).json({"error" :error.message });
            }
    }
}