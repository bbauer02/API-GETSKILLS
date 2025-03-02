const {models} = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');

module.exports = (app) => {
    app.get('/api/exams/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            console.log(`DEBUG - findExamByPk - Recherche de l'examen ID=${req.params.id}`);
            
            const parameters = {}; 
            parameters.include = [
                {
                    model: models['Test'],
                    include: [
                        {
                            model: models['Institut'],
                            as: 'owner',
                            attributes: ['institut_id', 'label']
                        }
                    ]
                },
                {
                    model: models['Level']
                },
                {
                    model: models['Skill'],
                    as: 'skills',
                    through: { attributes: [] }
                }
            ];
            parameters.where = { exam_id: req.params.id };

            const exam = await models['Exam'].findOne(parameters);
            
            if(exam === null) {
                const message = `L'examen n'existe pas. Veuillez réessayer avec un autre identifiant d'examen.`;
                return res.status(404).json({message});
            }
            
            console.log(`DEBUG - findExamByPk - Examen trouvé: ID=${exam.exam_id}, test_id=${exam.test_id}`);
            
            const message = `Examen trouvé`;
            res.json({message, exam: exam})
        }
        catch(error) {
            console.error('Erreur lors de la récupération de l\'examen:', error);
            const message = `Service non disponible. Veuillez réessayer plus tard.`;
            res.status(500).json({message, data: error})
        }
    });
}