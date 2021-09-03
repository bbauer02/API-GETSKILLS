const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/tests/:test_id/csvitems',
        isAuthenticated, isAuthorized, async (req, res) => {

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

                    const message = `An error has occured creating the template.`;
                    return res.status(500).json({ message, data: error.message })
                }
            }


            async function createNewItem() {
                try {

                    const values = {
                        test_id: req.params.test_id,
                        label: null,
                        field: null,
                        order: null
                    };

                    const itemCreated = await models['csvItem'].create(values);
                    return itemCreated;

                } catch (error) {
                    const message = `An error has occured creating the itemCsv.`;
                    return res.status(500).json({ message, data: error.message })
                }
            }

            try {

                // Si on a un body -> bulk
                const hasBody = req.body !== undefined;
                if (hasBody) {
                    const allItemsCreated = await createAndUpdateAllItems();
                    const messageItems = `Template has been update/created !`;
                    res.json({ messageItems, data: allItemsCreated });
                }

                // Sinon on créer un item avec tout à null (sauf test_id)
                else {
                    const itemCreated = await createNewItem();
                    const messageItem = `ItemCsv with id ${itemCreated.csvItem_id} has been created !`;
                    res.json({ messageItem, data: itemCreated });
                }


            } catch (error) {
                const message = `An error has occured.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
    );
}
