const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/tests/:test_id/csvitems',
        isAuthenticated, isAuthorized, async (req, res) => {

            async function removeAllItemsWithTestId() {
                try {
    
                    await models['csvItem'].destroy({
                        where : {
                            test_id: req.params.test_id
                        }
                    });

                } catch (error) {

                    const message = `An error has occured removing all the items for this test.`;
                    return res.status(500).json({ message, data: error.message })
                }
            }


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

            // unused
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
                // Le formulaire envoyant un série d'items sans pouvoir les supprimer,
                // il faut donc supprimer tout les items avant des les recréer
                await removeAllItemsWithTestId();

                const allItemsCreated = await createAndUpdateAllItems();
                
                const messageItems = `Template has been updated !`;
                res.json({ messageItems, data: allItemsCreated });

            } catch (error) {
                const message = `An error has occured.`;
                return res.status(500).json({ message, data: error.message })
            }
        }
    );
}
