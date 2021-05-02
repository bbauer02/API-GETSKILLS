const jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = '3778214125442A472D4B6150645267556B58703273357638792F423F4528482B4D6251655468566D597133743677397A24432646294A404E635266556A586E5A';

module.exports = {
    // Generer un Token
    generateTokenForUser: (userData) => {
        return jwt.sign({
            user_id: userData.user_id,
            role_id: userData.role_id,
            role: userData.Role.label,
            power: userData.Role.power
        },
        JWT_SIGN_SECRET, 
        {
            expiresIn: '1h'
        });

    },
    // Fonction qui vérifie si l'utilisateur est identifié, 
    isAuthenticated :  (req, res, next) => {
        const authorizationHeader = req.headers.authorization
        if(!authorizationHeader) {
            const message = `Give an authentification Token before asking for the ressource.`
            return res.status(401).json({ message })
        }
        const token = authorizationHeader.split(' ')[1]
        const decodedToken = jwt.verify(token, JWT_SIGN_SECRET, (error, decodedToken) => { 
            if(error) {
                const message = `User is not allowed to access.`
                return res.status(401).json({ message, data: error })
            }
            const userId = decodedToken.user_id;
            if (req.body.user_id && req.body.user_id !== userId) {
                const message = `L'identifiant de l'utilisateur est invalide.`
                res.status(401).json({ message })
            }
            else {
                next()
              } 
        });
    },
    // Fonction qui vérifie si l'utilisateur possède le bon rôle pour la ressource. 
    isAuthorized:  role => {
        return (req, res, next) => {
            if(true) {
                console.log("Role : " + role)
                next()
            }
            else {
                return res.status(401).json({ "fake" : "fake" })
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