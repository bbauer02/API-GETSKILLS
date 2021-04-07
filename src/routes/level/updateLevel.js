const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');

module.exports = (app) => {
    app.put('/api/levels/:id', async (req, res) => {
        try {
            const Level = await models['Level'].findByPk(req.params.id);
            if(Level === null) {
                const message = `Level doesn't exist.Retry with an other level id.`;
                return res.status(404).json({message});
            }
            Level.update(req.body,{
                where:{id:req.params.id}
            });
            const message = `Level id:${Level.id} has been updated `;
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
            res.status(500).json({message, data: error});
        }

    });
}