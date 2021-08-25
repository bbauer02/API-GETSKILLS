const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports = (app) => {
    app.get('/api/instituts/:institut_id/users/email', isAuthenticated, isAuthorized, async (req, res) => {


        // Cherche l'utilisateur
        async function findUser() {
            try {
                const parameters = {};

                parameters.where = { email: req.query.email };
                parameters.order = ['lastname'];
                parameters.include = [
                    {
                        model: models['Country'],
                        as: 'country',
                        attributes: ["label"]
                    },
                    {
                        model: models['Country'],
                        as: 'nationality',
                        attributes: [["countryNationality", 'label']]
                    },
                    {
                        model: models['Language'],
                        as: 'firstlanguage',
                        attributes: ['label']
                    },
                    {
                        model: models['Role'],
                        as: 'systemRole',
                        attributes: ['role_id', 'label', 'power']
                    }];

                parameters.attributes = { exclude: ['password'] };

                const User = await models['User'].findOne(parameters);
                if (User === null) {
                    const message = `User doesn't exist.Retry with another email.`;
                    return res.status(404).json({ message });
                }

                return User;

            } catch (error) {
                const message = `An error has occured finding the User.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // Check s'il est déjà dans l'institut
        async function checkIfUserIsAlreadyInInstitut(User) {
            try {

                const parameters = {};
                parameters.where = {
                    institut_id: req.params.institut_id,
                    user_id: User.dataValues.user_id
                };

                const institutHasUser = await models['institutHasUser'].findOne(parameters);

                if (institutHasUser !== null) {
                    const message = `This user is already in this institut`;
                    return res.status(404).json({ message });
                }

            } catch (error) {
                const message = `An error has occured checking if the User was in already in this institut.`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        // Check s'il est déjà dans la session
        async function checkIfUserIsAlreadyInSession(User) {
            try {

                const parameters = {};
                parameters.where = {
                    user_id: User.dataValues.user_id
                };

                if (req.query.sessions) {
                    const session = parseInt(req.query.sessions);
                    if (isNaN(session)) {
                        const message = `Session id should be an integer.`;
                        return res.status(400).json({ message })
                    }
                    parameters.where.session_id = session;
                }

                const sessionHasUser = await models['sessionUser'].findOne(parameters);

                if (sessionHasUser !== null) {
                    const message = `This user is already in this session`;
                    return res.status(404).json({ message });
                }

            } catch (error) {
                const message = `An error has occured checking if the User was in already in this session.`;
                return res.status(500).json({ message, data: error.message })
            }
        }



        try {
            const User = await findUser();

            // Check si présent dans l'institut
            if (!req.query.sessions) {
                await checkIfUserIsAlreadyInInstitut(User);
            }

            // Sinon check pour savoir s'il est inscrit à la session
            // Nécéssite ?sessions=session_id
            else {
                await checkIfUserIsAlreadyInSession(User);
            }

            const message = `User has been found`;
            res.json({ message, data: User });

        } catch (error) {
            const message = `An error has occured .`;
            return res.status(500).json({ message, data: error.message })
        }

    });
}
