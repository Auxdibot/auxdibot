import { Auxdibot } from '@/interfaces/Auxdibot';
import express from 'express';
import checkAuthenticated from '../checkAuthenticated';
import Modules from '@/constants/bot/commands/Modules';
import { ChannelType } from 'discord.js';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

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
   /*
   Channels
   View all text channels on the server.
   */
   router.get(
      '/:serverID/channels',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return res.json(
            guild.channels.cache.filter(
               (i) => [ChannelType.GuildText, ChannelType.GuildAnnouncement].indexOf(i.type) != -1,
            ),
         );
      },
   );

   /*
   Log
   View the latest log on your server & the log channel.
   */
   router.get(
      '/:serverID/log',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return auxdibot.database.servers
            .findFirst({
               where: { serverID: serverID },
               select: { serverID: true, latest_log: true, log_channel: true },
            })
            .then(async (data) =>
               data ? res.json({ ...guildData, data }) : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   /*
   Log channel
   Set the log channel for your server
   */
   router.post(
      '/:serverID/log_channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            new_log_channel = req.body['new_log_channel'];
         if (!new_log_channel || typeof new_log_channel != 'string')
            return res.status(400).json({ error: 'This is not a valid log channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(new_log_channel);
         if (!channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { log_channel: true, serverID: true },
               data: { log_channel: new_log_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.LOG_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Log Channel for this server has been changed to ${channel.name}`,
               });
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   /*
   Nick
   Nickname the bot on your server
   */
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
   /*
   Reset
   Reset bot settings
   */
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
   /*
   Modules
   Toggle and get disabled modules
   */
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
                     .update({
                        where: { serverID },
                        select: { serverID: true, disabled_modules: true },
                        data: { disabled_modules: modules },
                     })
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
