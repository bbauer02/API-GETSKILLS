const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/empowermentTests', async (req, res) => {

            // PARAMETERS
            //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
            const institutId = req.body.institut_id;
            const userId = req.body.user_id;
            const testId = req.body.test_id;

            // vérifier l'institut
            await models['Institut'].findOne({
                where: {institut_id: institutId}
            }).then(function (institutFound) {
                if (institutFound === null) {
                    const message = `institut doesn't exist. Retry with an other institut id.`;
                    return res.status(404).json({message});
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({message, data: error.message})
            });


            // vérifier le user
            await models['User'].findOne({
                where: {user_id: userId}
            }).then(function (userFound) {
                if (userFound === null) {
                    const message = `user doesn't exist. Retry with an other exam id.`;
                    return res.status(404).json({message});
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({message, data: error.message})
            });

            // vérifier le test
            await models['Test'].findOne({
                where: {test_id: testId}
            }).then(function (userFound) {
                if (userFound === null) {
                    const message = `test doesn't exist. Retry with an other exam id.`;
                    return res.status(404).json({message});
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({message, data: error.message})
            });


            // création de l'habillitation
            await models['empowermentTests'].findOne({
                where: {institut_id: institutId, user_id: userId, test_id: testId}
            }).then(function (empowermentTestsFound) {
                if (empowermentTestsFound) {
                    // l'habillitation existe déjà
                    const message = `Creation impossible. EmpowermentTests already exist. Try PUT method.`;
                    return res.status(500).json({message, data: null})

                } else {
                    // le'habillitation n'a pas été défini -> il faut le créer
                    models['empowermentTests'].create({
                        institut_id: institutId,
                        exam_id: examId,
                        price: price,
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