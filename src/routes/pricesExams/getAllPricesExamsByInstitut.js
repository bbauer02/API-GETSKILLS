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

        // récupérer tous les exams pour un institut
        // sequelize.query(`SELECT i.label as 'institut', t.label as 'test', e.label as 'exam', p.price FROM instituts as i INNER JOIN prices_exams as p ON i.institut_id = p.institut_id INNER JOIN exams as e ON p.exam_id = e.exam_id INNER JOIN tests as t ON e.test_id = t.test_id WHERE i.institut_id = ${institutId}`)

        await models['Test'].findAndCountAll({
            attributes: ['test_id', 'label'],
            required: true,
            include: [{
                model: models['Exam'],
                attributes: ['exam_id', 'label'],
                required: true,
                include: [{
                    attributes: ['institut_id', 'label'],
                    model: models['Institut'],
                    where: {institut_id: institutId},
                    required: true,
                }]
            }]
        }).then(function (pricesFound) {
            return pricesFound.rows.reduce(function (prev, curr) {
                curr.dataValues.Exams.forEach((exam) => {
                    let item = { test_id: '', institut_id: '', exam_id: '', price: ''};
                    item.test_id = curr.dataValues.test_id;
                    item.institut_id = exam.Instituts[0].ExamsPrice.institut_id;
                    item.exam_id = exam.Instituts[0].ExamsPrice.exam_id;
                    item.price = exam.Instituts[0].ExamsPrice.price
                    prev = [...prev, item];
                })
                return prev;
            }, [])
        }).then(function (pricesFound) {
            const message = `${pricesFound} price(s) found`;
            return res.json({message, data: pricesFound})
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({message, data: error.message})
        })
    });
}