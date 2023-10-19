const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.delete('/api/instituts/:institut_id/sessionUsers/:sessionUser_id/exams/:exam_id/options/:option_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {

            const optionDeleted = await models['sessionUserOption'].destroy({
                where:
                   {
                        exam_id: req.params.exam_id,
                        option_id: req.params.option_id,
                        sessionUser_id: req.params.sessionUser_id
                    }
              });

              const message = `The Option has been deleted from the user Option.`;
              res.json({message, optionDeleted : req.params.option_id});

        }catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message:error.message, data:error})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()});
        } 

    })
};