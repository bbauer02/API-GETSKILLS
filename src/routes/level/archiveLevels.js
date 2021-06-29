const {models} = require('../../models');
const { Op } = require("sequelize");
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/level/archive/:id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const Level = await models['Level'].findByPk(req.params.level_id);
            if(Level === null) {
                const message = `Level doesn't exist.Retry with an other level id.`;
                return res.status(404).json({message});
            }
            Level.update({isArchive: true},{
                where:{id:req.params.level_id}
            });
            const message = `Level id:${Level.level_id} has been updated `;
            res.json({message, data: Level});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.message});
        }
    });
}