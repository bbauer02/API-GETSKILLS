const { models } = require('../models');
module.exports = { 
    
    isAllowedToDeleteOptions: async (req, res, next) => {
        try {
            const optionToDelete = await models['sessionUserOption'].findOne({
                where: {
                    exam_id: req.params.exam_id,
                    option_id: req.params.option_id,
                    sessionUser_id: req.params.sessionUser_id
                },
                include: [{
                    model: models['sessionUser'],
                    attributes: ['sessionUser_id', 'hasPaid'],
                    include: [
                        {
                            model: models['Session'],
                            attributes: ['session_id', 'validation']
                        }
                    ]
                }]
            });


            if(optionToDelete=== null) {
                throw new Error(`The option doesn't exist`);
            }

            const hasPaid = optionToDelete?.sessionUser?.hasPaid;
            const validation = optionToDelete?.sessionUser?.Session?.validation;
            if(!!hasPaid) {
                throw new Error(`The custumer has already paid ! cannot modify options.`);
            }
            if(!!validation) {
                throw new Error(`Session is Validated, You cannot change the options !`);
            }

            return next();
        }
        catch(error){
            
            res.status(401).json({ "error": error.message });
        }

    },
    isAllowedToAddOrEditOptions: async (req, res, next) => {
        try {
            const {session_id, sessionUser_id} = req.body;
            
            // On vérifie si la session en question existe : 
            const session = await models['Session'].findOne({
                where: { session_id: session_id }
            });

            if(!!!session) {
                throw new Error(`session doesn't exist. Retry with an other session id.`);
            }
            if(!!session.validation) {
                throw new Error(`Session is Validated, You cannot change the options !`);
            }

            // On vérifie si l'Utilisateur a payé son inscription : 
            const sessionUser = await models['sessionUser'].findOne({
                where : { sessionUser_id : sessionUser_id},
                include: [{
                    model: models['sessionUserOption']
                }]
            });

            if (!!!sessionUser) {
                throw new Error(`The sessionUser doesn't exist.`);
            }
            if(!!sessionUser.hasPaid) {
                throw new Error(`The custumer has already paid ! cannot modify options.`);
            }

            res.locals.session = session;
            res.locals.sessionUser = sessionUser;

            return next();
        }
        catch(error){
            
            res.status(401).json({ "error": error.message });
        }
    }
}