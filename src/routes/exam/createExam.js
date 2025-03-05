const { ValidationError, UniqueConstraintError } = require('sequelize');
const { models } = require('../../models');
const sequelize = require('../../db/sequelize');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');
const PermissionService = require('../../auth/permissions/permissionService');

module.exports = app => {
    app.post('/api/exams', isAuthenticated, authorize, async (req, res) => {
        try {
            console.log('DEBUG - createExam - Requête reçue:', req.body);
            
            // Logs détaillés sur l'utilisateur
            console.log('DEBUG - createExam - Utilisateur ID:', req.accessToken.user_id);
            console.log('DEBUG - createExam - Utilisateur Rôle Système:', req.accessToken.systemRole);
            console.log('DEBUG - createExam - Instituts de l\'utilisateur:', JSON.stringify(req.accessToken.instituts || []));
            
            // Afficher les rôles de l'utilisateur dans les instituts
            if (req.accessToken.instituts && req.accessToken.instituts.length > 0) {
                req.accessToken.instituts.forEach(institut => {
                    console.log(`DEBUG - createExam - Institut ${institut.institut_id} - Rôle: ${institut.role}, Power: ${institut.power}`);
                });
            } else {
                console.log('DEBUG - createExam - L\'utilisateur n\'appartient à aucun institut!');
            }
            
            // Extraction des données de base de l'examen et des compétences associées
            const { skills, ...examData } = req.body;
            
            // Vérification des données obligatoires
            if (!examData.label) {
                return res.status(400).json({ message: "Le libellé de l'examen est obligatoire." });
            }
            
            // Vérifier que test_id est présent
            if (!examData.test_id) {
                return res.status(400).json({ message: "L'identifiant du test (test_id) est requis pour créer un examen." });
            }
            
            // Récupérer le test pour vérifier son existence et son propriétaire
            const test = await models['Test'].findByPk(examData.test_id, {
                include: [{
                    model: models['Institut'],
                    as: 'owner',
                    attributes: ['institut_id', 'label']
                }]
            });
            
            if (!test) {
                return res.status(404).json({ message: `Le test avec l'ID ${examData.test_id} n'existe pas.` });
            }
            
            console.log(`DEBUG - createExam - Test trouvé: ID=${test.test_id}, owner_id=${test.owner_id}`);
            if (test.owner) {
                console.log(`DEBUG - createExam - Propriétaire du test: ${test.owner.label} (ID=${test.owner.institut_id})`);
            } else {
                console.log(`DEBUG - createExam - ATTENTION: Le test n'a pas de propriétaire défini!`);
            }
            
            // Vérification spécifique: l'utilisateur a-t-il le droit de créer un examen pour ce test?
            // Cette vérification s'ajoute à la vérification générale déjà faite par le middleware authorize
            if (test.owner_id) {
                const userId = req.accessToken.user_id;
                const canCreateExam = await PermissionService.canCreateResourceForTest(userId, test.test_id, 'exam');
                
                if (!canCreateExam) {
                    console.log(`DEBUG - createExam - Permission refusée: l'utilisateur ${userId} ne peut pas créer d'examen pour le test ${test.test_id} (propriété de l'institut ${test.owner_id})`);
                    return res.status(403).json({ 
                        message: "Vous n'avez pas les droits nécessaires pour créer un examen pour ce test." 
                    });
                }
                
                console.log(`DEBUG - createExam - Permission accordée: l'utilisateur ${userId} peut créer un examen pour le test ${test.test_id}`);
            }
            
            // Vérifier si l'utilisateur a le droit de créer un examen pour ce test
            const userInstituts = req.accessToken.instituts || [];
            const userBelongsToOwner = userInstituts.some(institut => institut.institut_id === test.owner_id);
            console.log(`DEBUG - createExam - L'utilisateur appartient à l'institut propriétaire: ${userBelongsToOwner}`);
            
            // Vérifier que level_id existe si fourni
            if (examData.level_id) {
                const levelExists = await models['Level'].findByPk(examData.level_id);
                if (!levelExists) {
                    return res.status(400).json({ message: `Le niveau avec l'ID ${examData.level_id} n'existe pas.` });
                }
            }
            
            // Valeurs par défaut pour certains champs
            examData.isWritten = examData.isWritten !== undefined ? examData.isWritten : false;
            examData.isOption = examData.isOption !== undefined ? examData.isOption : false;
            examData.price = examData.price || 0;
            examData.coeff = examData.coeff || 1;
            examData.nbrQuestions = examData.nbrQuestions || 0;
            examData.duration = examData.duration || 0;
            examData.successScore = examData.successScore || 50;
            
            // Transaction pour garantir l'intégrité des données
            try {
                // Vérifier que sequelize est défini
                if (!sequelize) {
                    console.error('DEBUG - createExam - sequelize est undefined');
                    throw new Error('La connexion à la base de données n\'est pas disponible');
                }
                
                console.log('DEBUG - createExam - Début de la transaction');
                const result = await sequelize.transaction(async (t) => {
                    // Créer l'examen
                    const exam = await models['Exam'].create(examData, { transaction: t });
                    console.log(`DEBUG - createExam - Examen créé avec succès: ID=${exam.exam_id}`);
                    
                    // Si des compétences sont fournies, créer les associations
                    if (skills && Array.isArray(skills) && skills.length > 0) {
                        console.log(`DEBUG - createExam - Ajout de ${skills.length} compétences à l'examen`);
                        
                        // Vérifier que toutes les compétences existent
                        const existingSkills = await models['Skill'].findAll({
                            where: { skill_id: skills },
                            transaction: t
                        });
                        
                        if (existingSkills.length !== skills.length) {
                            throw new Error("Certaines compétences spécifiées n'existent pas.");
                        }
                        
                        // Créer les associations compétence-examen
                        const skillAssociations = skills.map(skillId => ({
                            exam_id: exam.exam_id,
                            skill_id: skillId
                        }));
                        
                        await models['ExamHasSkill'].bulkCreate(skillAssociations, { transaction: t });
                        console.log(`DEBUG - createExam - Associations avec les compétences créées`);
                    }
                    
                    // Récupérer l'examen créé avec ses compétences
                    return models['Exam'].findByPk(exam.exam_id, {
                        include: [{
                            model: models['Skill'],
                            as: 'skills',
                            through: { attributes: [] }
                        }],
                        transaction: t
                    });
                });
                
                console.log('DEBUG - createExam - Transaction terminée avec succès');
                const message = `L'examen '${result.label}' a été créé avec succès.`;
                res.status(201).json({ message, exam: result });
            } catch (error) {
                console.error('Erreur lors de la transaction:', error);
                throw error; // Relancer l'erreur pour qu'elle soit capturée par le bloc catch principal
            }
        }
        catch(error) {
            if(error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error });
            }
            console.error('Erreur lors de la création de l\'examen:', error);
            const message = `L'examen n'a pas pu être créé: ${error.message}`;
            res.status(500).json({ message, data: error });
        }
    });
}