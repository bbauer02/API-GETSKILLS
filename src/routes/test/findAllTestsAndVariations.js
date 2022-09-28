﻿const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');
module.exports =  (app) => {
    /* 
    DEPRECIATED 
    */
    app.get('/api/testsAll', async (req,res) => {
       try {
        // This Route testsAll is now depreciated, prefer use /api/tests?child=true
        console.log("[WARNING] This Route testsAll is now depreciated, prefer use '/api/tests?child=true'");
            const Tests = await models['Test'].findAndCountAll({
                order:['label'],
                include:
                [
                    {
                        model: models['Test'],
                        as:'child',
                        include:[{
                            model: models['Level']
                        }]
                    },
                    {
                        model: models['Level']
                    }
                ]
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