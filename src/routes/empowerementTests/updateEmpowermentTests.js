﻿const { models } = require('../../models');
const { Op } = require('sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/empowermenttests/:empowermentTest_id', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        const institutId = req.body.institut_id;
        const userId = req.body.user_id;
        const testId = req.body.test_id;


        async function checkInstitut() {
            try {

                // vérifier l'institut
                const institutFound = await models['Institut'].findOne({
                    where: { institut_id: institutId }
                });

                if (institutFound === null) {
                    const message = `institut doesn't exist. Retry with an other institut id.`;
                    return res.status(404).json({ message });
                } else {
                    return institutFound;
                }

            } catch {
                const message = `An error has occured while cheking the institut_id`;
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
                    const message = `user doesn't exist. Retry with an other exam id.`;
                    return res.status(404).json({ message });
                } else {
                    return userFound;
                }

            } catch (error) {
                const message = `An error has occured while cheking the user_id`;
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
                    const message = `test doesn't exist. Retry with an other exam id.`;
                    return res.status(404).json({ message });
                } else {
                    return testFound;
                }

            } catch (error) {
                const message = `An error has occured while cheking the test_id`;
                return res.status(500).json({ message, data: error.message })
            }
        }



        async function updateUser(User) {
            try {
                await User.update(req.body, {
                    where: { user_id: User.dataValues.user_id }
                });

            } catch (error) {
                if(error instanceof UniqueConstraintError) {
                    return res.status(400).json({message: error.message, data:error})
                }
                if(error instanceof ValidationError) {
                    return res.status(400).json({message: error.message, data:error})
                }
                const message = `An error has occured while updating the User`;
                return res.status(500).json({ message, data: error.message })
            }

        }


        async function updateEmpowerment() {
            try {
                const checkEmpowerment = await models['empowermentTests'].findOne({
                    where: { empowermentTest_id: req.params.empowermentTest_id }
                });

                if (checkEmpowerment) {
                    await checkEmpowerment.update(
                        req.body, {
                        where: { empowermentTest_id: req.params.empowermentTest_id }
                    }
                    )

                    return checkEmpowerment;
                }

            } catch (error) {
                if(error instanceof UniqueConstraintError) {
                    return res.status(400).json({message: error.message, data:error})
                }
                if(error instanceof ValidationError) {
                    return res.status(400).json({message: error.message, data:error})
                }
                const message = `An error has occured while update the Empowerment`;
                return res.status(500).json({ message, data: error.message })
            }

        }


        try {
            await checkInstitut();
            const userFound = await checkUser();
            await checkTest();
            await updateUser(userFound);
            const empowermentTestsFound = await updateEmpowerment();

            const message = `Empowerment and User has been updated`;
            res.json({ message, data: empowermentTestsFound });

        } catch (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({ message, data: error.message })
        }

    })
}