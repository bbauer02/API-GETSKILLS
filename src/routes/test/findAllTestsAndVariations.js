const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    app.get('/api/testsAll', async (req,res) => {
       try {
            const Tests = await models['Test'].findAndCountAll({
                order:['label']
            });
            const message = `${Tests.count} test(s) found`;
            res.json({message, data: Tests.rows});
       }
       catch (error){
         const message = `Service not available. Please retry later.`;
         res.status(500).json({message, data: error})
       }


    });
}