import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import checkAuthenticated from '../checkAuthenticated';
import Modules from '@/constants/bot/commands/Modules';

const router = express.Router();

export const serversRoute = (auxdibot: Auxdibot) => {
   router.get(
      '/',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         return res.json(req.user?.guilds).status(200);
      },
   );
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
   router.post(
      '/:serverID/nick',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            newNickname = req.body['new_nickname'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return guild.members.me
            .setNickname(newNickname, 'Nickname changed from dashboard.')
            .then(() => res.json({ success: `nickname updated to ${newNickname}` }))
            .catch(() => res.json({ error: "couldn't update nickname" }));
      },
   );
   router.post(
      '/:serverID/reset',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         return auxdibot.database.servers
            .delete({ where: { serverID } })
            .then((i) =>
               i
                  ? auxdibot.database.servers
                       .create({ data: { serverID: i.serverID } })
                       .then((i) =>
                          i ? res.json({ data: i }) : res.status(500).json({ error: 'error creating server data' }),
                       )
                  : res.status(404).json({ error: 'no server found' }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router
      .route('/:serverID/modules')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, disabled_modules: true } })
               .then(async (data) =>
                  data
                     ? res.json({ ...guildData, data })
                     : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      )
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID,
               module = req.body['module'];
            if (
               !module ||
               typeof module != 'string' ||
               Object.keys(Modules).indexOf(module) == -1 ||
               !Modules[module]?.disableable
            )
               return res.status(400).json({ error: 'This is not a valid module!' });
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { disabled_modules: true } })
               .then(async (data) => {
                  if (!data) return res.status(404).json({ error: "couldn't find that server" });
                  const modules = data.disabled_modules.filter((i) => i != module);
                  if (modules.length == data.disabled_modules.length) modules.push(module);
                  return auxdibot.database.servers
                     .update({ where: { serverID }, data: { disabled_modules: modules } })
                     .then((i) =>
                        i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
                     );
               })
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
