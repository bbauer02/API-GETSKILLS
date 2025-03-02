const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.delete('/api/skills/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            const skillId = req.params.id;
            const skill = await models['Skill'].findByPk(skillId);
            
            if (skill === null) {
                const message = `La compétence demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return res.status(404).json({message});
            }
            
            // Vérifier si la compétence est utilisée dans des examens
            const examSkills = await models['ExamHasSkill'].findOne({
                where: { skill_id: skillId }
            });
            
            if (examSkills) {
                const message = `Cette compétence est utilisée dans un ou plusieurs examens et ne peut pas être supprimée.`;
                return res.status(400).json({message});
            }
            
            const skillLabel = skill.label;
            await skill.destroy();
            
            const message = `La compétence "${skillLabel}" a été supprimée avec succès.`;
            res.json({message});
        }
        catch (error) {
            console.error('Erreur lors de la suppression de la compétence:', error);
            const message = `La compétence n'a pas pu être supprimée. Réessayez dans quelques instants.`;
            res.status(500).json({message, data: error});
        }
    });
}
 