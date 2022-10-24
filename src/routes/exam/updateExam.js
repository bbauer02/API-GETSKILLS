const {models} = require('../../models');
const { ValidationError,UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.put('/api/exams/:id',isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const Exam = await models['Exam'].findByPk(req.params.id);
            if(Exam === null) {
                const message = `Exam doesn't exist.Retry with an other Exam id.`;
                return res.status(404).json({message});
            }
            await Exam.update(req.body,{
                where:{exam_id:req.params.id}
            });
            const message = `Exam id:${Exam.exam_id} has been updated `;
            res.json({message, exam: Exam});
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