﻿const { models } = require('../../models');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const { isAuthenticated, isAuthorized } = require('../../auth/jwt.utils');

// IMPORTANT
/*
A la difference de updateSession,
updateSessionAdmin n'efface pas l'attribut validation de la session
Cette route est destinée à invalider la session uniquement par les superadmins
ce qui n'est pas possible pour les admins d'instituts
*/

module.exports = (app) => {
    app.put('/api/instituts/:institut_id/sessions/:session_id/admin', isAuthenticated, isAuthorized, async (req, res) => {
        try {
            const Session = await models['Session'].findOne({
                where: {
                    session_id: req.params.session_id,
                    institut_id: req.params.institut_id
                }
            });
            
            if (Session === null) {
                const message = `Session doesn't exist.Retry with an other session id.`;
                return res.status(404).json({ message });
            }

            
            await Session.update(req.body.session, {
                where: { session_id: req.params.session_id }
            });
            const message = `Session id:${Session.session_id} has been updated `;
            res.json({ message, session: Session });
        }
        catch (error) {
            if (error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            const message = `Service not available. Please retry later.`;
            res.status(500).json({ message, data: error });
        }
    });
}