const {models} = require("../../models");
module.exports = (app) => {
    app.get('/api/instituts/:instituts_id/sessions/:session_id/users/:user_id/find_all', async (req, res) => {

        const institutId = req.params.institut_id;
        const sessionId = req.params.session_id;
        const userId = req.params.user_id ? req.params.user_id : null;

        try {
            const result = await getAllFieldsForSchoolDocuments(institutId, sessionId, userId);

            return res.status(200).json({message: "route ok", data: result});
        } catch (e) {
            return res.status(400).json({message: e.message, data: {}})
        }


    });


    async function getAllFieldsForSchoolDocuments (institutId, sessionId, userId) {

        return await models['Session'].findAll({
            where: {session_id: sessionId},
            include: [
                {
                    model: models['Institut'],
                },
                {
                    model: models['sessionUser'],
                    include:
                        [
                            {
                                model: models['User'],
                                where: userId ? {user_id: userId} : {}
                            },
                            {
                                model: models['sessionUserOption'],
                                include:
                                    [
                                        {
                                            model: models['Exam'],
                                            include:
                                                [
                                                    {
                                                        model: models['Test'],
                                                    },
                                                    {
                                                        model: models['Level'],
                                                    }
                                                ]
                                        }
                                    ]
                            }
                        ]
                },
            ]
        })
    }
}