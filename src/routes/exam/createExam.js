const { ValidationError, UniqueConstraintError } = require('sequelize');
const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = app => {
    app.post('/api/exams', isAuthenticated, authorize, async (req, res) => {
        try {
            console.log('DEBUG - createExam - Requête reçue:', req.body);
            
            // Vérifier que test_id est présent
            if (!req.body.test_id) {
                return res.status(400).json({ message: "L'identifiant du test (test_id) est requis pour créer un examen." });
            }
            
            // Récupérer le test pour vérifier son propriétaire
            const test = await models['Test'].findByPk(req.body.test_id);
            if (!test) {
                return res.status(404).json({ message: `Le test avec l'ID ${req.body.test_id} n'existe pas.` });
            }
            
            console.log(`DEBUG - createExam - Test trouvé: ID=${test.test_id}, owner_id=${test.owner_id}`);
            
            // Créer l'examen
            const exam = await models['Exam'].create(req.body);
            
            const message = `L'examen '${req.body.label}' a été créé avec succès.`;
            res.json({ message, exam });
        }
        catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            console.error('Erreur lors de la création de l\'examen:', error);
            const message = `L'examen n'a pas pu être créé. Veuillez réessayer ultérieurement.`;
            res.status(500).json({ message, data: error });
        }
    });
}