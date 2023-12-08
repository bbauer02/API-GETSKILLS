const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.post('/api/instituts/:institut_id/exams/:exam_id/price', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        const institutId = req.params.institut_id;
        const examId = req.params.exam_id;

       

        /**
         * tester si un institut existe en fonction de son ID
         * @returns {Promise<void>}
         */
        async function getInstitutById() {

            const institut = await models['Institut'].findOne({
                where: { institut_id: institutId }
            })

            if (institut === null) {
                return res.status(500).json({ message: 'This institut does not exist.', data: error })
            }
        }

        /**
         * tester si un exam existe en fonction de son id
         * @returns {Promise<void>}
         */
        async function getExamById() {
            const exams = await models['Exam'].findOne({
                where: { exam_id: examId }
            })

            if (exams === null) {
                return res.status(500).json({ message: 'This exam does not exist.', data: error })
            }
        }

        try {
            // ETAPE 1 -> on vérifie que l'institut existe
            await getInstitutById();

            // ETAPE 2 -> on vérifie que l'épreuve demandée existe
            await getExamById();

            const prices = {
                institut_id: institutId,
                exam_id: examId,
                price: +req.body.price,
                tva: +req.body.tva
            }

            // ETAPE 3 -> on ajoute le prix dans la base de données
            const priceCreated = await models['InstitutHasPrices'].create(prices);

            // FIN -> envoi de la réponse
            const message = `Price for institut ${institutId} and exam ${examId} has been created.`;
            return res.status(200).json({ message, price: priceCreated });

        } catch (error) {
            const messageError = `Service not available. Please retry later.`;
            res.status(500).json({ messageError, data: error });
        }
    })
}