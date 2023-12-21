const { models } = require('../../models');
const { ValidationError, UniqueConstraintError, Op } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');



module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessions/:session_id', isAuthenticated, isAuthorized, async (req, res) => {
        try {

            // On récupére le body de la requête
            const { session, sessionHasExams} = req.body;
            // on vérifie que l'Id de la session et de l'institut dans l'url correspondent à ceux passé dans le body
            if (+req.params.session_id !== +session.session_id) {
                const message = `The session id in the url doesn't match the session id in the body.`;
                return res.status(400).json({ message });
            }
            if (+req.params.institut_id !== +session.institut_id) {
                const message = `The session id in the url doesn't match the session id in the body.`;
                return res.status(400).json({ message });
            }
            // On vérifie que la session existe
            const SessionToUpdate =  await models['Session'].findOne({
                where: { 
                    session_id: +req.params.session_id,
                    institut_id: +req.params.institut_id
                }
            });
            // Si la session n'existe pas on retourne une erreur et on arrête le déroulé du script
            if (!SessionToUpdate) {
                const message = `Session doesn't exist.Retry with an other session id.`;
                return res.status(404).json({ message });
            }
            // si Validtion du BodyHTML est différent de la valeur actuelle alors
            // On met à jour avec la nouvelle valeur
            const { validation } = SessionToUpdate.dataValues;
            if(!!session.validation ==! validation) {
                const ValidationUpdated = await SessionToUpdate.update(session, {
                    where: { 
                        session_id: +req.params.session_id,
                        institut_id: +req.params.institut_id
                    }
                });
                const message = `Validation Changed !!`;
                res.json({ message, session: ValidationUpdated });
            }
            else {
                // Si session est validée, on ne peux plus changer le test et le level    
                if (validation) {
                    delete session.test_id;
                    delete session.level_id;
                }
                const SessionUpdated = await SessionToUpdate.update(session, {
                    where: { 
                        session_id: req.params.session_id,
                        institut_id: req.params.institut_id
                    }
                });

                let sessionHasExamsUpdated = [];
                if(sessionHasExams !== null) {
                    sessionHasExams.map((sessionHasExam, index) => { 
                        sessionHasExamsUpdated[index] = {};
                        // sessionHasExam_id
                        sessionHasExamsUpdated[index].sessionHasExam_id = sessionHasExam.sessionHasExam_id;
                        // exam_id
                        sessionHasExamsUpdated[index].exam_id = sessionHasExam.examId;
                        // session_id
                        sessionHasExamsUpdated[index].session_id = session.session_id;
                        // adresse de l'épreuve
                        sessionHasExamsUpdated[index].adressExam = sessionHasExam.adressExam;
                        // salle de l'épreuve
                        sessionHasExamsUpdated[index].room = sessionHasExam.room;
                        // date et heure de l'épreuve
                        sessionHasExamsUpdated[index].DateTime = sessionHasExam.DateTime; 
                    });
    
                    const sessionHasExamsUpdated_ = await models['sessionHasExam'].bulkCreate(sessionHasExamsUpdated, { 
                        updateOnDuplicate: [
                            "adressExam",
                            "DateTime",
                            "room"
                        ] 
                    });
                    const message = `Session id:${SessionUpdated.session_id} and all linked sessionHAsExam have been updated `;
                    res.json({ message, session: SessionUpdated , sessionHasExams: sessionHasExamsUpdated_});
                } 
                else {
                    const message = `Session id:${SessionUpdated.session_id} and all linked sessionHAsExam have been updated `;
                    res.json({ message, session: SessionUpdated });
                }
            }
        }
        catch (error) {
            const message = `An error has occured finding the Session.`;
            return res.status(500).json({ message, data: error.message })
        }
        

       




/*



        async function updateAllSessionHasExam() {
            try {

                let sessionHasExamsForCreate = [];

                Object.values(req.body.examsForSessionCreate).map((exam, index) => {
                    sessionHasExamsForCreate[index] = {};
                    // exam_id
                    sessionHasExamsForCreate[index].sessionHasExam_id = exam.sessionHasExam_id;
                    // exam_id
                    sessionHasExamsForCreate[index].exam_id = exam.exam_id;
                    // session_id
                    sessionHasExamsForCreate[index].session_id = exam.session_id;
                    // adresse de l'épreuve
                    sessionHasExamsForCreate[index].adressExam = exam.adressExam;
                    // salle de l'épreuve
                    sessionHasExamsForCreate[index].room = exam.room;
                    // date et heure de l'épreuve
                    sessionHasExamsForCreate[index].DateTime = exam.DateTime;
                });

                await models['sessionHasExam'].bulkCreate(sessionHasExamsForCreate, { 
                    updateOnDuplicate: [
                        "adressExam",
                        "DateTime",
                        "room"
                    ] 
                });

            } catch (error) {
                if (error instanceof ValidationError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                if (error instanceof UniqueConstraintError) {
                    return res.status(400).json({ message: error.message, data: error })
                }
                const message = `An error has occured creating the sessionHasExams.`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        try {

            const sessionFound = await findSession();
            const updatedSession = await updateSession(sessionFound.dataValues.validation, sessionFound);
            await updateAllSessionHasExam();


            const message = `Session id:${updatedSession.session_id} and all linked sessionHAsExam have been updated `;
            res.json({ message, data: updatedSession });
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }*/
    });
}