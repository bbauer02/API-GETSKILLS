﻿const {models} = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/exams/:id',isAuthenticated, isAuthorized, async (req,res) => {
        try {
            const parameters = {}; 
            parameters.where = {exam_id:req.params.id};

            const Exam = await models['Exam'].findOne(parameters);
            if(Exam === null) {
                const message = `Exam doesn't exist.Retry with an other Exam id.`;
                return res.status(404).json({message});
            }
            const message = `Exam found`;
            res.json({message, exam: Exam})
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error})
        }
    });
}