const {models} = require('../models');
const bcrypt = require('bcrypt');
const jwtUtils = require('../auth/jwt.utils');
module.exports = (app) => {
    app.post('/api/login',async (req, res) => {
        try {
            const user = await models['User'].findOne({
                where:
                {
                    login:req.body.login
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
                            model: models['Country'],
                            as:'firstlanguage',
                            attributes : [["countryLanguage",'label']]
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
                        }
                    ]
            });
            if(user === null) {
                const message = `Login doesn't exist`;
                return res.status(404).json({message});
            }
           isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if(!isPasswordValid) {
                const message = `invalid password`;
                return res.status(401).json({message})
            } 



            const message = `User has been connected`;
            delete user.dataValues.password;
                return res.json(
                    {
                        message, 
                        data:user,
                        token: jwtUtils.generateTokenForUser(user)
                    });
        }
        catch(error) {
            const message = `User cannot be authentified. Please retry later.`;
            res.status(500).json({message, data: error.toString()});
        }
    });
}