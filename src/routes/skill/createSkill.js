const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports =  app => {
    app.post('/api/skills', isAuthenticated, authorize, async (req, res) => {
        console.log('DEBUG - POST /api/skills - req.body:', JSON.stringify(req.body, null, 2));
        
        try {
            // Vérifier que test_id est présent dans le body
            if (!req.body.test_id) {
                console.log('DEBUG - test_id manquant dans le body');
                return res.status(400).json({
                    message: "Le champ test_id est requis pour créer une compétence",
                    data: null
                });
            }
            
            // Vérifier que le test existe
            const testExists = await models['Test'].findByPk(req.body.test_id);
            if (!testExists) {
                return res.status(400).json({
                    message: `Le test avec l'ID ${req.body.test_id} n'existe pas.`,
                    data: null
                });
            }
            
            // Vérifier que le libellé est présent
            if (!req.body.label) {
                return res.status(400).json({
                    message: "Le libellé de la compétence est obligatoire",
                    data: null
                });
            }
            
            const skill = await models['Skill'].create(req.body);
            console.log('DEBUG - Skill créée avec succès:', JSON.stringify(skill, null, 2));
            const message = `La compétence '${req.body.label}' a été créée avec succès.`;
            res.json({message, data: skill})
        }
        catch(error) {
            console.log('DEBUG - Erreur lors de la création de la compétence:', error);
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data: error.message})
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data: error.message})
            }
            const message = `La compétence n'a pas pu être créée. Réessayez dans quelques instants.`;
            res.status(500).json({message, data: error.message});
        }
    });
}