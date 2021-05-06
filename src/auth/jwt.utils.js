const jwt = require('jsonwebtoken');
const ENV = require('dotenv').config().parsed;
let JWT_SIGN_SECRET = ENV.JWT_SIGN_SECRET;

module.exports = {
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
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized:  powerNeeded => {
        return  async (req, res, next) => {
            try {
            
                const decodedToken = await module.exports.getHeaderToken(req);
                if(req.params.institut_id ) {
                    const userMemberOfInstitut = decodedToken.instituts.find(({institut_id}) => institut_id === req.params.institut_id );
                    if(userMemberOfInstitut && userMemberOfInstitut.Role.power >= powerNeeded) {
                        next();
                    }
                }
                next();/*
                console.log(decodedToken.systemRole && decodedToken.systemRole.power >= powerNeeded)
                if(decodedToken.systemRole && decodedToken.systemRole.power >= powerNeeded  ) {
                    next();
                }

                    throw new Error('Not granted any authorities');   */ 
            }
            catch(error) {
                res.status(401).json({"error" :error.message });
            }
        }
    }
    /*// Fonction qui vérifie si s'il y a une entéte "Autorisation" dans la requete
    parseAuthorization: (authorization) => {
        return (authorization != null) ? authorization.replace('Bearer ', '') :null;
    },
    getUserId:  (authorization) => {
        let userId = -1;
        const token = module.exports.parseAuthorization(authorization);
        if(token!=null) {
            try {
                const jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null)
                userId = jwtToken.user_id;
            } catch(error) {

            }
        }
        return userId;
    }*/
}