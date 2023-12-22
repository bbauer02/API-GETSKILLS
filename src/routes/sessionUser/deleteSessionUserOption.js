const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
const { isAllowedToDeleteOptions } = require('../../services/middlewares');

module.exports = (app) => {
    app.delete('/api/instituts/:institut_id/sessionUsers/:sessionUser_id/exams/:exam_id/options/:option_id', isAuthenticated, isAuthorized,isAllowedToDeleteOptions, async (req, res) => {
      
        try {

            await models['sessionUserOption'].destroy({
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
            console.log("error")
            res.status(500).json({ "error": error });
        } 

    })
};