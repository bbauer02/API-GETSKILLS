const {models} = require('../../models');
const {Op} = require('sequelize');
const {isAuthenticated, isAuthorized} = require('../../auth/jwt.utils');
const asyncLib = require('async');

module.exports = (app) => {
    app.post('/api/instituts/exams/price', isAuthenticated, isAuthorized, async (req, res) => {

            // PARAMETERS
            //TODO: il faudra récupérer l'id de l'institut directement à partir de l'id de l'utilisateur
            const institutId = req.body.institut_id;
            const examId = req.body.exam_id;
            const price = req.body.price;
            const isAdmin = req.body.isAdmin;

            // PRINCIPE -> dès qu'une fonction asynchrone lève une erreur, le waterfall permet d'empêcher de passer à la fonction suivante.
            asyncLib.waterfall([

                // ETAPE 1 -> on vérifie que l'institut existe

                    function (done) {
                        models['Institut'].findOne({
                            where: {institut_id: institutId}
                        }).then(function (institutFound) {
                            if (institutFound === null) {
                                const message = `institut doesn't exist. Retry with an other institut id.`;
                                return res.status(404).json({message});
                            } else {
                                done(null, institutFound)
                            }
                        }).catch(function (error) {
                            const message = `Service not available. Please retry later.`;
                            return res.status(500).json({message, data: error.message})
                        })
                    },

                // ETAPE 2 -> on vérifie que l'épreuve demandée existe

                    function (institutFound, done) {
                        models['Exam'].findOne({
                            where: {exam_id: examId}
                        }).then(function (examFound) {
                            if (examFound === null) {
                                const message = `exam doesn't exist. Retry with an other exam id.`;
                                return res.status(404).json({message});
                            } else {
                                // le prix n'a pas été défini -> il faut le créer
                                done(null, institutFound, examFound)
                            }
                        }).catch(function (error) {
                            const message = `Service not available. Please retry later.`;
                            return res.status(500).json({message, data: error.message})
                        });
                    },

                // ETAPE 3 -> on vérifie que le prix est absent de la base de données

                    function (institutFound, examFound, done) {
                        models['InstitutHasPrices'].findOne({
                            where: {
                                institut_id: institutFound.institut_id,
                                exam_id: examFound.exam_id,
                                isAdmin: isAdmin
                            }
                        }).then(function (examPriceFound) {
                            if (examPriceFound) {
                                // le prix existe déjà
                                const message = `Creation impossible. Price already exist. Try PUT method.`;
                                return res.status(500).json({message, data: null})

                            } else {
                                // le prix est absent de la base
                                done(null, institutFound, examFound, examPriceFound)
                            }
                        }).catch(function (error) {
                            const message = `Service not available. Please retry later.`;
                            return res.status(500).json({message, data: error.message})
                        })
                    },

                // ETAPE 4 -> on ajoute le prix dans la base de données

                    function (institutFound, examFound, examPriceFound, done) {
                        models['InstitutHasPrices'].create({
                            institut_id: institutFound.institut_id,
                            exam_id: examFound.exam_id,
                            price: price,
                            isAdmin: isAdmin
                        }).then(function (examPriceCreated) {
                            console.log(examPriceCreated)
                            done(examPriceCreated)

                        }).catch(function (error) {
                            const message = `Creation impossible !`;
                            return res.status(500).json({message, data: error.message})
                        })
                    },
                ],

                // FIN -> envoi de la réponse

                function (examPriceCreated) {
                    if (examPriceCreated) {
                        const message = `Price for ${examPriceCreated.price} coin has been created.`;
                        return res.status(200).json({message, data: examPriceCreated})
                    } else {
                        return res.status(500).json({message:'error: cannot create exam price', data: null});
                    }
                }
            )

        }
    );
}