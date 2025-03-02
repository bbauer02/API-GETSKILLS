const {models} = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.put('/api/tests/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            const test = await models['Test'].findByPk(req.params.id);
            if(test === null) {
                const message = `Le test n'existe pas. Veuillez réessayer avec un autre identifiant de test.`;
                return res.status(404).json({message});
            }
            
            if(req.body.parent_id === -1 || req.body.parent_id === '-1') {
                req.body.parent_id = null;
            }
            
            // Conserver le owner_id original si non fourni dans la requête
            if (!req.body.owner_id) {
                req.body.owner_id = test.owner_id;
            }
            
            await test.update(req.body);
            
            const message = `Le test avec l'ID ${test.test_id} a été mis à jour avec succès.`;
            res.json({message, test});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data: error});
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data: error});
            }
            console.error('Erreur lors de la mise à jour du test:', error);
            const message = `Service non disponible. Veuillez réessayer plus tard.`;
            res.status(500).json({message, data: error});
        }
    });
}