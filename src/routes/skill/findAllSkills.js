const { models } = require('../../models');
const { isAuthenticated } = require('../../auth/jwt.utils');
const { authorize } = require('../../auth/permissions');
const { Op } = require('sequelize');

module.exports = (app) => {
    app.get('/api/skills', isAuthenticated, authorize, async (req, res) => {
        try {
            console.log('DEBUG - findAllSkills - Requête reçue avec paramètres:', req.query);
            
            // Paramètres de requête
            const parameters = {
                where: {},
                order: [['label', 'ASC']]
            };
            
            // Filtrer par test_id si fourni (via test ou test_id)
            let testId = null;
            if (req.query.test) {
                testId = parseInt(req.query.test);
                if (isNaN(testId)) {
                    const message = `Le paramètre test doit être un entier.`;
                    return res.status(400).json({ message });
                }
            } else if (req.query.test_id) {
                testId = parseInt(req.query.test_id);
                if (isNaN(testId)) {
                    const message = `Le paramètre test_id doit être un entier.`;
                    return res.status(400).json({ message });
                }
            }
            
            // Si un test_id est spécifié, vérifier s'il s'agit d'un test enfant
            if (testId) {
                const test = await models['Test'].findByPk(testId, {
                    include: [{ model: models['Test'], as: 'parent' }]
                });
                
                if (test) {
                    if (test.parent_id) {
                        console.log(`DEBUG - findAllSkills - Test ${testId} est un enfant du test ${test.parent_id}`);
                        // Si c'est un test enfant, récupérer les compétences du test enfant ET du test parent
                        parameters.where.test_id = {
                            [Op.or]: [testId, test.parent_id]
                        };
                    } else {
                        // Si c'est un test parent, récupérer uniquement ses compétences
                        parameters.where.test_id = testId;
                    }
                } else {
                    // Si le test n'existe pas, utiliser quand même l'ID fourni
                    parameters.where.test_id = testId;
                }
            }
            
            // Filtrer les compétences parentes ou toutes les compétences
            // Par défaut ou si child=false, on ne renvoie que les compétences parentes (parent_id=null)
            if (req.query.child !== 'true') {
                parameters.where.parent_id = null;
                console.log('DEBUG - findAllSkills - Filtrage des compétences parentes uniquement');
            } else {
                console.log('DEBUG - findAllSkills - Inclusion de toutes les compétences (parentes et enfants)');
            }
            
            // Paramètre : LIMIT
            if (req.query.limit) {
                const limit = parseInt(req.query.limit);
                if (isNaN(limit)) {
                    const message = `Le paramètre limit doit être un entier.`;
                    return res.status(400).json({ message });
                }
                parameters.limit = limit;
            }
            
            // Paramètre : OFFSET
            if (req.query.offset) {
                const offset = parseInt(req.query.offset);
                if (isNaN(offset)) {
                    const message = `Le paramètre offset doit être un entier.`;
                    return res.status(400).json({ message });
                }
                parameters.offset = offset;
            }
            
            // Inclure les compétences enfants si demandé
            if (req.query.include_children === 'true') {
                parameters.include = [{
                    model: models['Skill'],
                    as: 'child'
                }];
                console.log('DEBUG - findAllSkills - Inclusion des compétences enfants dans les résultats');
            }
            
            console.log('DEBUG - findAllSkills - Paramètres de requête:', parameters);
            
            const skills = await models['Skill'].findAll(parameters);
            
            console.log(`DEBUG - findAllSkills - ${skills.length} compétences trouvées`);
            
            const message = `${skills.length} compétence(s) trouvée(s).`;
            res.json({ message, data: skills });
        } catch (error) {
            console.error('Erreur lors de la récupération des compétences:', error);
            const message = `Les compétences n'ont pas pu être récupérées. Réessayez dans quelques instants.`;
            res.status(500).json({ message, data: error });
        }
    });
    
    app.get('/api/skills/:id', isAuthenticated, authorize, async (req, res) => {
        try {
            const parameters = {
                where: { skill_id: req.params.id }
            };
            
            // Inclure les compétences enfants si demandé
            if (req.query.include_children === 'true') {
                parameters.include = [{
                    model: models['Skill'],
                    as: 'child'
                }];
                console.log('DEBUG - findSkillById - Inclusion des compétences enfants dans les résultats');
            }
            
            const skill = await models['Skill'].findOne(parameters);
            
            if (skill === null) {
                const message = `La compétence demandée n'existe pas. Réessayez avec un autre identifiant.`;
                return res.status(404).json({ message });
            }
            
            const message = `La compétence a été trouvée.`;
            res.json({ message, data: skill });
        } catch (error) {
            console.error('Erreur lors de la récupération de la compétence:', error);
            const message = `La compétence n'a pas pu être récupérée. Réessayez dans quelques instants.`;
            res.status(500).json({ message, data: error });
        }
    });
}