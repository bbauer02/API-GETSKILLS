const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/tests/:test_id/exams/prices', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const institutId = parseInt(req.params.institut_id);
            const testId = parseInt(req.params.test_id);
            const parameters = {}; 
            parameters.where = {
                test_id: testId
            };
            parameters.attributes = ["exam_id", "test_id", "level_id", "label"]
            parameters.include =  [
                {
                    model: models['InstitutHasPrices'],
                    attributes: ["price", "tva"],
                    where: {
                        institut_id: institutId
                    }, 
                    required:false
                },
                
                {
                    model: models['Level'],
                    attributes: ["label"]

                } 
               
            ] 



            const examPrice = await models['Exam'].findAndCountAll(parameters);
            const message = `${examPrice.count} exams found`;
            res.json({message, examPrice: examPrice.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }


/*
        await models['Test'].findAndCountAll({
            attributes: ['test_id', 'label'],
            required: true,
            include: [{
                model: models['Exam'],
                attributes: ['exam_id', 'label'],
                required: true,
                include: [{
                    model: models['InstitutHasPrices'],
                    where: 
                    { 
                        institut_id: institutId,
                        exam_id: examId
                    },
                    required: true,
                    include: [{
                        model: models['Institut'],
                        attributes: ['institut_id', 'label'],
                        required: true
                    }]
                }]
            }]
        }).then(function (pricesFound) {
            if (pricesFound.length === 0) {
                const message = `no prices found`;
                return res.status(500).json({ message, data: null })
            } else {
                // reconstruction de la réponse
                return pricesFound.rows.reduce(function (prev, curr) {
                    curr.dataValues.Exams.forEach((exam) => {
                        let item = { test_id: '', institut_id: '', exam_id: '', price: '' };
                        item.test_id = curr.dataValues.test_id;
                        item.institut_id = exam.InstitutHasPrices[0].institut_id;
                        item.exam_id = exam.InstitutHasPrices[0].exam_id;
                        item.price = exam.InstitutHasPrices[0].price;
                        item.tva = exam.InstitutHasPrices[0].tva;
                        item.price_id = exam.InstitutHasPrices[0].price_id;
                        prev = [...prev, item];
                    })
                    return prev;
                }, [])
            }
        }).then(function (pricesFound) {
            const message = `${pricesFound.length} price(s) found`;
            return res.json({ message, data: pricesFound })
        }).catch(function (error) {
            const message = `Service not available. Please retry later.`;
            return res.status(500).json({ message, data: error.message })
        }) */
    });
}