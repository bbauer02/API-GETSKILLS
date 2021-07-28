const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

// TODO: isAuthenticated, isAuthorized
module.exports = (app) => {
    app.post('/api/empowermentTests', async (req, res) => {

            // PARAMETERS
            const institutId = req.body.institut_id;
            const userId = req.body.user_id;
            const testId = req.body.test_id;
            const code = req.body.code;
            let hasError = false;

            // vérifier l'institut
            await models['Institut'].findOne({
                where: {institut_id: institutId}
            }).then(function (institutFound) {
                if (institutFound === null) {
                    const message = `institut doesn't exist. Retry with another institut id.`;
                    return res.status(404).json({message});
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                hasError = true;
                return res.status(500).json({message, data: error.message})
            });


            // vérifier le user
            await models['User'].findOne({
                where: {user_id: userId}
            }).then(function (userFound) {
                if (userFound === null) {
                    const message = `user doesn't exist. Retry with another user id.`;
                    return res.status(404).json({message});
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                hasError = true;
                return res.status(500).json({message, data: error.message})
            });


            // vérifier la puissance du user dans l'institut
            await models['institutHasUser'].findOne({
                where: {
                    user_id: userId,
                    institut_id: institutId
                }
            }).then(function (institutHasUser) {
                if (institutHasUser === null) {
                    const message = `institutHasUser doesn't exist. Retry with another user id.`;
                    hasError = true;
                    return res.status(404).json({message});
                } else if (institutHasUser.dataValues.role_id < 2) {
                    const message = `This user can't be examinator in this institut`;
                    hasError = true;
                    return res.status(404).json({message});
                }

            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                hasError = true;
                return res.status(500).json({message, data: error.message})
            });


            // vérifier le test
            await models['Test'].findOne({
                where: {test_id: testId}
            }).then(function (userFound) {
                if (userFound === null) {
                    const message = `test doesn't exist. Retry with an other test id.`;
                    return res.status(404).json({message});
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                hasError = true;
                return res.status(500).json({message, data: error.message})
            });

            if (hasError === true) return res.status(500).json({message: "An error has occured"});

            // création de l'habillitation
            await models['empowermentTests'].findOne({
                where: {institut_id: institutId, user_id: userId, test_id: testId}
            }).then(function (empowermentTestsFound) {
                if (empowermentTestsFound) {
                    // l'habillitation existe déjà
                    const message = `EmpowermentTests already exist.`;
                    return res.status(500).json({message, data: empowermentTestsFound})

                } else {
                    // l'habillitation n'a pas été défini -> il faut la créer
                    models['empowermentTests'].create({
                        institut_id: institutId,
                        test_id: testId,
                        user_id: userId,
                        code: code
                    }).then(function (empowermentTestsCreated) {
                        const message = `EmpowermentTests has been created.`;
                        return res.status(200).json({message, data: empowermentTestsCreated})
                    }).catch(function (error) {
                        const message = `Creation impossible`;
                        return res.status(500).json({message, data: error.message})
                    })
                }

            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({message, data: error.message})
            })

        }
    );
}