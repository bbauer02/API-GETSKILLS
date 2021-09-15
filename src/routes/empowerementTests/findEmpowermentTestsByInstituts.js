const { models } = require('../../models');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports = (app) => {
    app.get('/api/instituts/:institut_id/empowermenttests', isAuthenticated, isAuthorized, async (req, res) => {

        // PARAMETERS
        const parameters = {};
        parameters.where = {};

        const institutId = parseInt(req.params.institut_id);
        if (isNaN(institutId)) {
            const message = `Institut parameter should be an integer.`;
            return res.status(400).json({ message })
        }
        parameters.where.institut_id = institutId;

        parameters.include = [{
            model: models['User'],
            attributes: { exclude: ['password'] },
            include: [{
                model: models['institutHasUser'],
                attributes: ['institut_id'],
                where: [{ institut_id: institutId }],
                as: 'instituts',
                include: [{
                    model: models['Role'],
                    attributes: ['role_id', 'label', 'power']
                }]
            }]
        },
        {
            model: models['Test'],
            attributes: ["label", "test_id"]
        }];


        async function checkInstitut() {
            try {
                // vérifier l'institut
                const institutFound = await models['Institut'].findOne({
                    where: { institut_id: institutId }
                });

                if (institutFound === null) {
                    const message = `institut doesn't exist. Retry with an other institut id.`;
                    return res.status(404).json({ message });
                } else {
                    return institutFound;
                }

            } catch (error) {
                const message = `An error has occured while cheking the institut_id`;
                return res.status(500).json({ message, data: error.message })
            }
        }


        async function findEmpowermentsByInstitut(_parameters) {
            try {
                const EmpowermentTestsFound = await models['empowermentTests'].findAll(_parameters);
                return EmpowermentTestsFound;

            } catch (error) {
                const message = `An error has occured while looking for empowerment of this institut`;
                return res.status(500).json({ message, data: error.message })
            }
        }

        try {

            await checkInstitut();
            const EmpowermentTestsFound = await findEmpowermentsByInstitut(parameters);

            const message = `${EmpowermentTestsFound.length} EmpowermentTests from institut ${institutId} found`;
            res.json({ message, data: EmpowermentTestsFound })

        } catch (error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error })
        }
    });
}