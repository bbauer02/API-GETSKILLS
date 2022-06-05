const path = require('path');
const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');


module.exports = (app) => {
    app.put('/api/users/:user_id',isAuthenticated,isAuthorized, async (req, res) => {
        try {
            let user = JSON.parse(req.body.user);
            const User = await models['User'].findByPk(user.user_id);
            if(User === null) {
                const message = `User doesn't exist.Retry with an other user id.`;
                return res.status(404).json({message});
            }
            // test du mimeType du fichier pour déterminer l'extension
            let extension = "";
            if(req.files) {
                switch(req.files.avatar.mimetype) {
                    case 'image/gif':
                        extension ="gif";
                    break;
                    case 'image/jpeg':
                        extension="jpg";
                    break;
                    case 'image/png':
                        extension="png";
                    break;
                }
                const d = new Date();
                const timestamp = d.getTime();
                const filename =  `${user.user_id}_${timestamp}.${extension}`;
                const FOLDER_AVATAR = path.join(process.cwd(),'public', 'images', 'avatars',filename);
                await req.files.avatar.mv(FOLDER_AVATAR);
                user.avatar = filename;
            }
            await User.update(user,{
                where:{user_id:user.user_id}
            });

            const message = `User id:${User.user_id} has been updated `;
            res.json({message, User});
        }
        catch (error) {
            if(error instanceof UniqueConstraintError) {
                return res.status(400).json({message: error.message, data:error})
            }
            if(error instanceof ValidationError) {
                return res.status(400).json({message: error.message, data:error})
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error});
        }
    });
}