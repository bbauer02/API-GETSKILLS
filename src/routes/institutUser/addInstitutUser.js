﻿const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/users', isAuthenticated, isAuthorized, async (req,res) => {

        // Créer utilisateur
        async function createUser() {
            try {

                const valuesForPostUser = { ...req.body };

                // useless?
                delete valuesForPostUser.roleInstitut;

                const userCreated = await models['User'].create(valuesForPostUser);
                return userCreated;

            } catch (error) {
                const message = `An error has occured creating the User.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // Ajouter l'utilsateur dans l'institut
        async function postInstitutHasUser(_userCreated) {
            try {

                const valuesForPostInstitutHasUser = {};
                
                // Si on essyae de mettre un superAdmin (role 10)
                if (Number(req.body.roleInstitut) === 10) {
                    throw new Error("You can't do that");
                } else {
                    valuesForPostInstitutHasUser.role_id = Number(req.body.roleInstitut);
                }

                // Pioche l'id du user créer, sinon l'id du user existant (ajout d'un user déjà existant)
                valuesForPostInstitutHasUser.user_id = _userCreated.dataValues.user_id || _userCreated.user_id;
                valuesForPostInstitutHasUser.institut_id = Number(req.params.institut_id);

                const institutHasUserCreated = await models['institutHasUser'].create(valuesForPostInstitutHasUser);
                return institutHasUserCreated;

            } catch (error) {
                if(error instanceof ValidationError) {
                    return res.status(400).json({message:error.message, data:error})
                }
                if(error instanceof UniqueConstraintError) {
                    return res.status(400).json({message: error.message, data:error})
                }
                const message = `An error has occured creating the institutUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        try {

            let user = {}

            // Si le user id n'est pas défini, créer le user
            // Le but étant d'avoir un user_id pour créer le institutHasUser
            // valeur par défautl de user_id === '', donner par formik
            if (req.body.user_id === '' || req.body.user_id === null || req.body.user_id === undefined) {
                const userCreated = await createUser();
                user = userCreated;
            }

            // Sinon cela va dire que le user existe déjà et qu'on l'ajoute seulement à l'institut
            // On a donc déjà l'id, qu'on donnera à user pour la méthode postInstitutHasUser
            else {
                user.user_id = req.body.user_id;
            }

            // On créer le institutHasUser
            const institutHasUserCreated = await postInstitutHasUser(user);

            // Le message change selon les actions effectuer
            const message = req.body.user_id !== undefined
                ?
                `User has been added to the institut.`
                :
                `User has been created and added to the institut.`;

            res.json({ message, data: institutHasUserCreated });

        } catch (error) {
            const message = `An error has occured .`;
            return res.status(500).json({ message, data: error.message })
        }
    }
    );
}
