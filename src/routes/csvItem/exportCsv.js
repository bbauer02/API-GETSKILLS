const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/sessions/:session_id/exports',
        isAuthenticated, isAuthorized, async (req, res) => {

            async function getAllItemCsvByTest() {
                try {
                    console.log("\n\ req.body=",  req.body, '\n\n');

                    const csvItemsFound = await models['csvItem'].findAll({
                        where : {
                            test_id: req.body.idTest
                        }
                    });

                    return csvItemsFound;

                } catch (error) {

                    const message = `An error has occured getting all the item csv with test_id ${req.body.test_id}`;
                    return res.status(500).json({ message, data: error.message })
                }
            }

            async function getAllInformations() {
                try {

                    parameters = {};
                    parameters.where = {};
                    req.body.values.forEach((idSessionUser, index) => {
                        parameters.where[index] = {
                            sessionUser_id: idSessionUser
                        }
                    });

                    console.log("\n\nparameters=", paramaters, '\n\n');
    
                    const allInformations = await models['sessionUser'].findAll(parameters);
                    console.log("\n\allInformations=", allInformations, '\n\n');

                    return allInformations;

                } catch (error) {

                    const message = `An error has occured finding all the informations from sessionUser_id`;
                    return res.status(500).json({ message, data: error.message })
                }
            }
           

            try {
                const csvItemsFound = await getAllItemCsvByTest();
                const allInformations = await getAllInformations();

                const messageItems = `File has been sent!`;
                res.json({ messageItems, data: /* TODO */ null });

            } catch (error) {
                const message = `An error has occured.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
    );
}
