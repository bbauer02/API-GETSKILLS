const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/tests/:test_id/csvitems',
        isAuthenticated, isAuthorized, async (req, res) => {

            // Ancien fonctionnement
            /*
            async function createAndUpdateAllItems() {
                try {

                    let allItemsForCreate = [];

                    Object.values(req.body).map((item, index) => {
                        allItemsForCreate[index] = {};
                        allItemsForCreate[index].test_id = req.params.test_id;
                        allItemsForCreate[index].label = item.label;
                        allItemsForCreate[index].field = item.field;
                        allItemsForCreate[index].order = index;
                    });
    
                    await models['csvItem'].bulkCreate(allItemsForCreate, { 
                        updateOnDuplicate: [
                            "test_id",
                            "label",
                            "field",
                            "order"
                        ] 
                    });

                    return allItemsForCreate;

                } catch (error) {

                    const message = `An error has occured creating all the items for the template.`;
                    return res.status(500).json({ message, data: error.message })
                }
            }
            */

            async function createOrUpdateItem() {
                try {

                    // Create or update
                    const itemCreatedOrUpdated = await models['csvItem'].upsert(req.body);
                    return itemCreatedOrUpdated;

                } catch (error) {
                    const message = `An error has occured creating the itemCsv.`;
                    return res.status(500).json({ message, data: error.message })
                }
            }

            try {
                const itemCreatedOrUpdated = await createOrUpdateItem();
                const messageItems = `Template has been updated !`;
                res.json({ messageItems, data: itemCreatedOrUpdated });

            } catch (error) {
                const message = `An error has occured.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
    );
}
