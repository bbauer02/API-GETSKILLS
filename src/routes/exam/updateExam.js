const {models} = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.put('/api/exams/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            // Recherche de l'examen par son ID
            const exam = await models['Exam'].findByPk(req.params.id);
            
            if(exam === null) {
                const message = `L'examen n'existe pas. Veuillez réessayer avec un autre identifiant d'examen.`;
                return res.status(404).json({message});
            }

            // Extraction des données de base de l'examen et des compétences associées
            const { skills, ...examData } = req.body;
            
            // Vérification des données obligatoires
            if (!examData.label) {
                const message = `Le libellé de l'examen est obligatoire.`;
                return res.status(400).json({message});
            }
            
            // Vérification que test_id existe si fourni
            if (examData.test_id) {
                const testExists = await models['Test'].findByPk(examData.test_id);
                if (!testExists) {
                    const message = `Le test avec l'ID ${examData.test_id} n'existe pas.`;
                    return res.status(400).json({message});
                }
            }
            
            // Vérification que level_id existe si fourni
            if (examData.level_id) {
                const levelExists = await models['Level'].findByPk(examData.level_id);
                if (!levelExists) {
                    const message = `Le niveau avec l'ID ${examData.level_id} n'existe pas.`;
                    return res.status(400).json({message});
                }
            }
            
            // Mise à jour des données de base de l'examen
            await exam.update(examData);
            
            // Si des compétences sont fournies, mettre à jour les relations
            if (skills && Array.isArray(skills)) {
                // Vérification que toutes les compétences existent
                if (skills.length > 0) {
                    const existingSkills = await models['Skill'].findAll({
                        where: {
                            skill_id: skills
                        }
                    });
                    
                    if (existingSkills.length !== skills.length) {
                        const message = `Certaines compétences spécifiées n'existent pas.`;
                        return res.status(400).json({message});
                    }
                }
                
                // Supprimer toutes les associations existantes
                await models['ExamHasSkill'].destroy({
                    where: { exam_id: exam.exam_id }
                });
                
                // Créer les nouvelles associations
                if (skills.length > 0) {
                    const skillAssociations = skills.map(skillId => ({
                        exam_id: exam.exam_id,
                        skill_id: skillId
                    }));
                    
                    await models['ExamHasSkill'].bulkCreate(skillAssociations);
                }
            }
            
            // Récupérer l'examen mis à jour avec ses compétences
            const updatedExam = await models['Exam'].findByPk(req.params.id, {
                include: [{
                    model: models['Skill'],
                    as: 'skills',
                    through: { attributes: [] } // Ne pas inclure les attributs de la table de jointure
                }]
            });
            
            const message = `L'examen avec l'ID ${exam.exam_id} a été mis à jour avec succès.`;
            res.json({message, exam: updatedExam});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data: error});
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data: error});
            }
            console.error('Erreur lors de la mise à jour de l\'examen:', error);
            const message = `Service non disponible. Veuillez réessayer plus tard.`;
            res.status(500).json({message, data: error});
        }
    });
}