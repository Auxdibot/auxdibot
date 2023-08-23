import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import checkAuthenticated from '../checkAuthenticated';
import log from './routes/log';
import reset from './routes/reset';
import channels from './routes/channels';
import logChannel from './routes/logChannel';
import nick from './routes/nick';
import modules from './routes/modules';
import punishments from './routes/punishments';

const router = express.Router();

export const serversRoute = (auxdibot: Auxdibot) => {
   /*
   root
   Obtain a list of servers
   */
   router.get(
      '/',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         return res.json(req.user?.guilds).status(200);
      },
   );
   /*
   /:serverID
   Obtain data about your server
   */
   router.get(
      '/:serverID',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            check = req.query['check'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         return auxdibot.database.servers
            .findFirst({ where: { serverID }, ...(check ? { select: { serverID: true } } : {}) })
            .then((i) =>
               i ? res.json({ ...guildData, data: i }) : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   log(auxdibot, router);
   reset(auxdibot, router);
   modules(auxdibot, router);
   channels(auxdibot, router);
   logChannel(auxdibot, router);
   nick(auxdibot, router);
   punishments(auxdibot, router);
   return router;
};
