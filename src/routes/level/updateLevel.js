const {models} = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.put('/api/levels/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            const level = await models['Level'].findByPk(req.params.id);
            if(level === null) {
                const message = `Le niveau n'existe pas. Veuillez réessayer avec un autre identifiant de niveau.`;
                return res.status(404).json({message});
            }
            
            await level.update(req.body);
            
            const message = `Le niveau avec l'ID ${level.level_id} a été mis à jour avec succès.`;
            res.json({message, level});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data: error});
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data: error});
            }
            console.error('Erreur lors de la mise à jour du niveau:', error);
            const message = `Service non disponible. Veuillez réessayer plus tard.`;
            res.status(500).json({message, data: error});
        }
    });
}