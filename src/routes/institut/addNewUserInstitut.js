const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/newUser', isAuthenticated, isAuthorized, async (req, res) => {

        async function createUser() {
            try {

                // 0 - Créer User
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

        async function postInstitutHasUser(_userCreated) {
            try {

                // 1 - Post Institut has user
                const valuesForPostInstitutHasUser = {};
                valuesForPostInstitutHasUser.role_id = Number(req.body.roleInstitut);
                valuesForPostInstitutHasUser.user_id = _userCreated.dataValues.user_id;
                valuesForPostInstitutHasUser.institut_id = Number(req.params.institut_id);

                const institutHasUserCreated = await models['institutHasUser'].create(valuesForPostInstitutHasUser);
                return institutHasUserCreated;

            } catch (error) {
                const message = `An error has occured creating the institutUser.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {
            const userCreated = await createUser();
            const institutHasUserCreated = await postInstitutHasUser(userCreated);

            const message = `User has been created and added to the institut.`;
            res.json({message, data:institutHasUserCreated});

        } catch (error) {
            const message = `An error has occured .`;
            return res.status(500).json({ message, data: error.message })
        }
    }
    );
}
