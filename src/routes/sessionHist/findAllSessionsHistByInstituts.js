const {models} = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

module.exports =  (app) => {
    app.get('/api/instituts/:institut_id/sessionsHist', isAuthenticated,isAuthorized, async (req,res) => {
        try {
            const parameters = {};
            parameters.where = {};

                const institut_id = parseInt(req.params.institut_id);
                if(isNaN(institut_id) ) {
                    const message = `Institut parameter should be an integer.`;
                    return res.status(400).json({message})
                }
                parameters.where.institut_id = institut_id;

                // Sessions après une date
                if(req.query.after) {
                    const after = moment(req.query.after,"YYYY-MM-DD");
                    parameters.where.start = {
                        [Op.gte]: after
                    }
                }
                // Sessions avant une date
                if(req.query.before) {
                    const before = moment(req.query.before,"YYYY-MM-DD");
                    parameters.where.start = {
                        [Op.lte]: before
                    }
                }
                // Sessions dans entre 2 dates
                if(req.query.start && req.query.end) {
                    const start = moment(req.query.start,"YYYY-MM-DD");
                    const end = moment(req.query.end,"YYYY-MM-DD");
                    parameters.where.start = {
                        [Op.between]: [start,end]
                    }
                }
                else {
                    // Sessions débutant à une date
                    if(req.query.start) {
                        let start = moment(req.query.start +' 00:00',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                        let end = moment(req.query.start + ' 23:59',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                        parameters.where.start = {
                            [Op.between]: [start ,end]
                        }
                    }
                    // Sessions finissant à une date
                    if(req.query.end) {
                        let start = moment(req.query.end +' 00:00',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                        let end = moment(req.query.end + ' 23:59',"DD/MM/YYYY HH:mm").format('YYYY-MM-DD HH:mm');
                        parameters.where.end = {
                            [Op.between]: [start ,end]
                        }
                    }
                }

            // Parameter : LIMIT
            if(req.query.limit) {
                const limit = parseInt(req.query.limit);       
                if(isNaN(limit) ) {
                    const message = `Limit parameter should be an integer.`;
                    return res.status(400).json({message})
                }
                parameters.limit = limit;
            }
            // Parameter : OFFSET
            if(req.query.offset) {
                const offset = parseInt(req.query.offset);       
                if(isNaN(offset) ) {
                const message = `Offset parameter should be an integer.`;
                return res.status(400).json({message})
                }
                parameters.offset = parseInt(req.query.offset);
            }
            


            const SessionsArchives = await models['SessionHist'].findAndCountAll(parameters);
            const message = `${SessionsArchives.count} sessions ARCHIVES found`;
            res.json({message, data: SessionsArchives.rows});
        }
        catch(error) {
            const message = `Service not available. Please retry later.`;
            res.status(500).json({message, data: error.toString()})
        }
    });
}