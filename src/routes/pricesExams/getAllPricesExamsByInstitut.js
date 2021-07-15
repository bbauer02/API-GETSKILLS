const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/exams_prices/:institutId', async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = parseInt(req.params.institutId);


        // vérifier l'institut
        await models['Institut'].findOne({
            where: {institut_id: institutId}
        }).then(function (institutFound) {
            if (institutFound === null) {
                const message = `institut doesn't exist. Retry with an other institut id.`;
                return res.status(404).json({message});
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });


        // vérifier l'exam
        await models['Exam'].findOne({
            where: {exam_id: institutId}
        }).then(function (examFound) {
            if (examFound === null) {
                const message = `exam doesn't exist. Retry with an other exam id.`;
                return res.status(404).json({message});
            }
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        });


        // récupérer tous les exams pour un institut
        // `SELECT i.label as 'institut', t.label as 'test', e.label as 'exam', p.price FROM instituts as i JOIN prices_exams as p ON i.institut_id = p.institut_id JOIN exams as e ON p.exam_id = e.exam_id JOIN tests as t ON e.test_id = t.test_id WHERE i.institut_id = ${institutId}`
        await models['Test'].findAndCountAll({
            attributes: ['label'],
            required: true,
            include: [{
                model: models['Exam'],
                attributes: ['label'],
                required: true,
                include: [{
                    attributes: ['label'],
                    model: models['Institut'],
                    where: {institut_id: institutId},
                    required: true,
                }]
            }]
        }).then(function (pricesFound) {
            const message = `${pricesFound.count} price(s) found`;
            return res.json({message, data: pricesFound})
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        })
    });
}