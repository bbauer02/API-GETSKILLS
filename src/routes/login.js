const {models} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const privateKey = require('../auth/private_key');

module.exports = (app) => {
    app.post('/api/login',async (req, res) => {
        try {
            const user = await models['User'].findOne({where: {login:req.body.login}});
            if(user === null) {
                const message = `Login doesn't exist`;
                return res.status(404).json({message});
            }
           isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if(!isPasswordValid) {
                const message = `invalid password`;
                return res.status(401).json({message})
            } 

            // JWT
            const token = jwt.sign(
                {userId: user.user_id },
                privateKey,
                {expiresIn: '24h'}
            )



            const message = `User has been connected`;
                return res.json({message, data:user, token})
        }
        catch(error) {
            const message = `User cannot be authentified. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}