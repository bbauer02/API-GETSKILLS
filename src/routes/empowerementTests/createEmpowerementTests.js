const { models } = require('../../models');
const { Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/empowermentTests', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        const institutId = req.body.institut_id;
        const userId = req.body.user_id;
        const testId = req.body.test_id;
        const code = req.body.code;

        async function checkInstitut() {
            try {

                // vérifier l'institut
                const institutFound = await models['Institut'].findOne({
                    where: { institut_id: institutId }
                });

                if (institutFound === null) {
                    const message = `institut doesn't exist. Retry with another institut id.`;
                    return res.status(404).json({ message });
                } else {
                    return institutFound;
                }

            } catch (error) {
                const message = `An error has occured while checking the institut_id`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function checkUser() {
            try {

                // vérifier le user
                const userFound = await models['User'].findOne({
                    where: { user_id: userId }
                });

                if (userFound === null) {
                    const message = `user doesn't exist. Retry with another user id.`;
                    return res.status(404).json({ message });
                }
            } catch (error) {
                const message = `An error has occured while checking the user_id`;
                return res.status(500).json({ message, data: error.message })
            }
        }



        async function checkPowerOfUserToBeExaminator() {
            try {

                // vérifier la puissance du user dans l'institut
                const institutHasUserFound = await models['institutHasUser'].findOne({
                    where: {
                        user_id: userId,
                        institut_id: institutId
                    },
                    include: [
                        {
                            model: models['Role']
                        }
                    ]
                });

                if (institutHasUserFound === null) {
                    const message = `institutHasUser doesn't exist. Retry with another user id.`;
                    return res.status(404).json({ message });
                } else if (institutHasUserFound.dataValues.Role.power < 2) {
                    const message = `This user can't be examinator in this institut`;
                    return res.status(404).json({ message });
                } else {
                    return institutHasUserFound
                }

            } catch (error) {
                const message = `An error has occured while checking the power of the user (futur examinator) in the institut`;
                return res.status(500).json({ message, data: error.message })
            }
        }




        async function checkTest() {
            try {

                // vérifier le test
                const testFound = await models['Test'].findOne({
                    where: { test_id: testId }
                });

                if (testFound === null) {
                    const message = `test doesn't exist. Retry with an other test id.`;
                    return res.status(404).json({ message });
                } else {
                    return testFound
                }

            } catch (error) {
                const message = `An error has occured while cheking the test_id`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        // USELESS ?
        async function checkEmpowerment() {
            try {

                // Check si l'habilitation existe déjà
                const empowermentFound = await models['empowermentTests'].findOne({
                    where: { institut_id: institutId, user_id: userId, test_id: testId }
                });

                if (empowermentFound) {
                    // l'habillitation existe déjà
                    const message = `EmpowermentTests already exist.`;
                    return res.status(500).json({ message, data: empowermentFound })
                } else {
                    return empowermentFound;
                }

            } catch (error) {
                const message = `An error has occured while cheking if the empowerment already exists`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function createEmpowerment() {
            try {
                // l'habillitation n'a pas été défini -> il faut la créer
                const empowermentCreated = await models['empowermentTests'].create({
                    institut_id: institutId,
                    test_id: testId,
                    user_id: userId,
                    code: code
                });

                return empowermentCreated;

            } catch (error) {
                const message = `An error has occured while creating the empowerment`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        try {
            await checkInstitut();
            await checkUser();
            await checkPowerOfUserToBeExaminator();
            await checkTest();
            await checkEmpowerment();
            const empowermentCreated = await createEmpowerment();

            const message = `Empowerment has been created`;
            res.json({ message, data: empowermentCreated });

        } catch (error) {
            const message = `An error has occured.`;
            return res.status(500).json({ message, data: error.message })
        }

    }
    );
}