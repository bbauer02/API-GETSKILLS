const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const asyncLib = require('async');

/**
 * tester si un institut existe en fonction de son ID
 * @param institutId
 * @returns {Promise<void>}
 */
async function getInstitutById (institutId) {

    const institut = await models['Institut'].findOne({
        where: {institut_id: institutId}
    })

    if (institut === null) {
        throw new Error(`institut doesn't exist. Retry with an other institut id.`);
    }
}

/**
 * tester si un exam existe en fonction de son id
 * @param examId
 * @returns {Promise<void>}
 */
async function getExamById (examId) {
    const exams = await models['Exam'].findOne({
        where: {exam_id: examId}
    })

    if (exams === null) {
        throw new Error(`exam doesn't exist. Retry with an other exam id.`);
    }
}

/**
 * tester si un institut a des prix
 * @param institutId
 * @param examId
 * @returns {Promise<void>}
 */
async function getInstitutHasPrice (institutId, examId) {
    const prices = await models['InstitutHasPrices'].findOne({
        where: {
            institut_id: institutFound.institut_id,
            exam_id: examFound.exam_id
        }
    });

    if (prices === null) {
        throw new Error(`Creation impossible. Price already exist. Try PUT method.`);
    }
}


module.exports = (app) => {
    app.post('/api/instituts/exams/price', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
        const institutId = req.body.institut_id;
        const examId = req.body.exam_id;
        const price = req.body.price;

        try {
            // ETAPE 1 -> on vérifie que l'institut existe
            await getInstitutById(institutId);

            // ETAPE 2 -> on vérifie que l'épreuve demandée existe
            await getExamById(examId);

            // ETAPE 3 -> on vérifie que le prix est absent de la base de données
            await getInstitutHasPrice(institutId, examId);

            // ETAPE 4 -> on ajoute le prix dans la base de données
            const priceCreated = await models['InstitutHasPrices'].create(req.body)

            if (priceCreated === null) {
                return res.status(500).json({message: 'error: cannot create exam price'});

            } else {
                // FIN -> envoi de la réponse
                const message = `Price for ${examPriceCreated.price} coin has been created.`;
                return res.status(200).json({message, data: examPriceCreated})
            }

        } catch (e) {
            return res.status(500).json({message: e.message, data: null});
        }
    })
}