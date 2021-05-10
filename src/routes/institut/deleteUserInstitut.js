const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');

module.exports = (app) => {
    app.delete('/api/instituts/:institut_id/users/:user_id',async (req,res) => {
        try {
            const Institut = await models['Institut'].findByPk(req.params.institut_id);
            const User = await models['User'].findByPk(req.params.user_id);
            if(Institut === null) {
              const message = `Institut doesn't exist.Retry with an other institut id.`;
              return res.status(404).json({message});
            }
            if(User === null) {
                const message = `User doesn't exist.Retry with an other user id.`;
                return res.status(404).json({message});
              }
            
            await models['institutHasUser'].destroy({where: {institut_id: Institut.institut_id, user_id: User.user_id  }});
            const message = `User id:${User.user_id} has been deleted from the institut`;
            res.json({message});
          }
          catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
          } 
    });
}
