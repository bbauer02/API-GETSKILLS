const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/instituts/:id_institut/sessionUsers/:sessionUser_id/exams/:exam_id/options/:option_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const sessionUserOption = await models['sessionUserOption'].findOne({
                where: {
                    sessionUser_id: req.params.sessionUser_id,
                    exam_id: req.params.exam_id,
                    option_id: req.params.option_id
                }
            });
            if(sessionUserOption === null) {
                const message = `The option doesn't exist.`;
                return res.status(404).json({message});
            }
            delete req.body.sessionUser_id;
            delete req.body.option_id;
            delete req.body.exam_id;

            sessionUserOption.update(req.body,{
                where: {
                    sessionUser_id: req.params.sessionUser_id,
                    exam_id: req.params.exam_id,
                    option_id: req.params.option_id
                }
            });
            const message = `The sessionUserOption session has been updated `;
            res.json({message, data: sessionUserOption});
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