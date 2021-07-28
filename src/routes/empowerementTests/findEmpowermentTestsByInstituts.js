const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:idInstitut/empowermentTests', async (req, res) => {
        try {
            const parameters = {};
            parameters.where = {};

            const institutId = parseInt(req.params.idInstitut);
            if (isNaN(institutId)) {
                const message = `Institut parameter should be an integer.`;
                return res.status(400).json({ message })
            }
            parameters.where.institut_id = institutId;

            // vérifier l'institut
            await models['Institut'].findOne({
                where: { institut_id: institutId }
            }).then(function (institutFound) {
                if (institutFound === null) {
                    const message = `institut doesn't exist. Retry with an other institut id.`;
                    return res.status(404).json({ message });
                }
            }).catch(function (error) {
                const message = `Service not available. Please retry later.`;
                return res.status(500).json({ message, data: error.message })
            });

            parameters.include = [{
                model: models['User'],
                attributes: {exclude:['password']},
                include: [{
                    model: models['institutHasUser'],
                    attributes:['institut_id'],
                    where: [{institut_id : institutId}],
                    as:'instituts',
                    include:[{
                        model:models['Role'],
                        attributes:['role_id','label','power']
                    }]
                }]},
            {
                model: models['Test'],
                attributes: ["label"]
            }];


            const EmpowermentTests = await models['empowermentTests'].findAll(parameters);
            const message = `${EmpowermentTests.length} EmpowermentTests from institut ${institutId} found`;
            res.json({ message, data: EmpowermentTests })
        }
        catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error })
        }
    });
}