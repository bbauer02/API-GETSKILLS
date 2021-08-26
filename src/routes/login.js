const {models} = require('../models');
const bcrypt = require('bcrypt');
const jwtUtils = require('../auth/jwt.utils');
const { token: config } = require('../config');

module.exports = (app) => {
    app.post('/api/login',async (req, res) => {
        try {
            // 1. On récupère le nom d'utilisateur et le mot de passe dans la requête.
            const { login, password } = req.body;
            // 2. On envoie une erreur au client si le paramètre 'login' est manquant.
            if(!login) {
                const message = `Login/Username is missing !`;
                return res.status(400).json({ message });
            }
            // 3. On envoie une erreur au client si le paramètre password est manquant.
            if(!password) {
                const message = `password is missing !`;
                return res.status(400).json({ message });
            }
            // 4. On vérifie si le nom d'utilisateur existe.
            const user = await models['User'].findOne({
                where:
                {
                    login:login
                }, 
                include: 
                        [{
                            model: models['Country'],
                            as:'country',
                            attributes : ["label"]
                        },
                        {
                            model: models['Country'],
                            as:'nationality',
                            attributes : [["countryNationality",'label']]
                        },
                        {
                            model: models['Language'],
                            as:'firstlanguage',
                            attributes : ['nativeName']
                        },
                        {
                            model: models['institutHasUser'],
                            attributes:['institut_id'],
                            as:'instituts',
                            include:[{
                                model:models['Institut'],
                                attributes:['label']
                            },
                            {
                                model:models['Role'],
                                attributes:['role_id','label','power']
                            }]
                        },
                        {
                            model: models['Role'],
                            as : 'systemRole'
                        },
                        {
                            model: models['sessionUser'],
                            include: [{
                                model: models['Session'],
                                include: [{
                                    model: models['Level']
                                },
                                {
                                    model: models['Test']
                                }]
                            }]
                        }
                    ]
            });
            if(user === null) {
                const message = `Username or password is incorrect`;
                return res.status(401).json({ message});
            }

            // 5. On envoie une erreur au client si les informations de connexion sont erronnées
           isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid) {
                const message = `Username or password is incorrect`;
                return res.status(401).json({ message})
            } 

            // 6. On supprime le champ "password" dans l'objet à retourner au client.
            delete user.dataValues.password;

            // 7. On créer le JWT et Token et on le stocke en BDD
            const {accessToken, refreshToken, xsrfToken}  = await jwtUtils.generateTokenForUser(user);

            // 9. On envoie au client le JWT et le refresh token       
            const message = `User has been connected`;

            // 10. On créer le cookie contenant le JWT 
            res.cookie('access_token',accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: config.accessToken.expiresIn
            })

            // 11. On créer le cookie contenant le refresh token 
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: config.refreshToken.expiresIn,
                path: '/token'
            });

            return res.json(
                {
                    accessToken,
                    tokenType: config.accessToken.type,
                    accessTokenExpiresIn: config.accessToken.expiresIn,
                    refreshToken,
                    refreshTokenExpiresIn: config.refreshToken.expiresIn,
                    xsrfToken,
                    message, 
                    user
                });
        }
        catch(error) {
            const message = `User cannot be authentified. Please retry later.`;
            res.status(500).json({message, data: error.toString()});
        }
    });
}
