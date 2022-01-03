const {models} = require('../../models');
const { Op } = require('sequelize');


module.exports =  (app) => {
// Route qui vérifie si le mail est disponible dans la base de données
    // ?email=test@test.fr
    // Route qui vérifie si l'identifiant est disponible
    // ?login=toto02
    app.get('/api/auth/register/institut', async(req, res) => {
        try { 
            const parameters = {};
            parameters.where = {};
            if(req.query.email) {
                parameters.where =  {email : req.query.email}    
            }
            else if(req.query.login) {
                parameters.where =  {login : req.query.login}    
            }
            else{
                const message = `Utilisez un des paramètres : 'email' ou 'login'`;
                return res.status(404).json({ message });
            }
            const User = await models['User'].findOne(parameters);
            if (User !== null) {
              const message = `User found.`;
              return res.status(200).json({message, alreadyExist: 'True'});
            }
            const message = `User not found`;
            return res.status(200).json({ message , alreadyExist: 'False'});
        }
        catch(err) {
            const message = `An error has occured finding the User.`;
            return res.status(500).json({ message, data: error.message })
        }
    });
}