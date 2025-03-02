const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.put('/api/skills/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            const skill = await models['Skill'].findByPk(req.params.id);
            if(skill === null) {
                const message = `La compétence demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return res.status(404).json({message});
            }

            // Vérification des données obligatoires
            if (!req.body.label) {
                const message = `Le libellé de la compétence est obligatoire.`;
                return res.status(400).json({message});
            }
            
            // Vérification que test_id existe si fourni
            if (req.body.test_id) {
                const testExists = await models['Test'].findByPk(req.body.test_id);
                if (!testExists) {
                    const message = `Le test avec l'ID ${req.body.test_id} n'existe pas.`;
                    return res.status(400).json({message});
                }
            }

            const updatedSkill = await skill.update(req.body);
            const message = `La compétence ${updatedSkill.label} a été mise à jour avec succès.`;
            res.json({message, data: updatedSkill});
        }
        catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data: error});
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data: error});
            }
            const message = `La compétence n'a pas pu être mise à jour. Réessayez dans quelques instants.`;
            res.status(500).json({message, data: error});
        }
    });
}