const { models } = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.delete('/api/questions/:question_id', isAuthenticated, async (req, res) => {
        try {
            const questionId = parseInt(req.params.question_id);
            if (isNaN(questionId)) {
                return res.status(400).json({ message: "L'identifiant de la question doit être un nombre." });
            }
            
            // Récupérer les informations de l'utilisateur depuis le token JWT
            const userId = req.accessToken.user_id;
            const userInstituts = req.accessToken.instituts || [];
            const systemRole = req.accessToken.systemRole;
            
            console.log(`DEBUG - deleteQuestion - User ID: ${userId}`);
            console.log(`DEBUG - deleteQuestion - System Role: ${systemRole ? systemRole.power : 'non défini'}`);
            
            // Vérifier si l'utilisateur est un administrateur système (power = 10)
            const isSystemAdmin = systemRole && systemRole.power === 10;
            console.log(`DEBUG - deleteQuestion - Est administrateur système: ${isSystemAdmin}`);
            
            // Extraire les IDs des instituts de l'utilisateur
            const userInstitutIds = userInstituts.map(institut => institut.institut_id);
            console.log(`DEBUG - deleteQuestion - Instituts de l'utilisateur: ${userInstitutIds.join(', ')}`);
            
            // Récupérer la question existante avec son test associé
            const question = await models['Question'].findOne({
                where: { question_id: questionId },
                include: [
                    {
                        model: models['Test'],
                        as: 'test',
                        include: [
                            {
                                model: models['Test'],
                                as: 'parent',
                                attributes: ['test_id', 'owner_id']
                            }
                        ]
                    }
                ]
            });
            
            if (!question) {
                return res.status(404).json({ message: "La question spécifiée n'existe pas." });
            }
            
            // Vérifier si l'utilisateur a le droit de supprimer cette question
            if (!isSystemAdmin) {
                // Déterminer le propriétaire du test (si c'est un test enfant, on regarde le propriétaire du parent)
                let ownerId;
                if (question.test.parent_id && question.test.parent) {
                    ownerId = question.test.parent.owner_id;
                } else {
                    ownerId = question.test.owner_id;
                }
                
                console.log(`DEBUG - deleteQuestion - Propriétaire du test: ${ownerId}`);
                
                // Vérifier si l'utilisateur appartient à l'institut propriétaire
                if (!userInstitutIds.includes(ownerId)) {
                    return res.status(403).json({ 
                        message: "Vous n'avez pas les droits nécessaires pour supprimer cette question." 
                    });
                }
            }
            
            // Supprimer d'abord les associations avec les compétences (skills)
            await models['QuestionSkills'].destroy({
                where: { question_id: questionId }
            });
            
            // Supprimer les associations avec les sujets (subjects) si elles existent
            if (models['SubjectHasQuestion']) {
                await models['SubjectHasQuestion'].destroy({
                    where: { question_id: questionId }
                });
            }
            
            // Supprimer la question
            await question.destroy();
            
            const message = `La question a été supprimée avec succès.`;
            res.json({ message });
        } catch (error) {
            console.error('Erreur lors de la suppression de la question:', error);
            const message = "La question n'a pas pu être supprimée. Veuillez réessayer ultérieurement.";
            res.status(500).json({ message, data: error.message });
        }
    });
}; 