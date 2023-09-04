import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction } from '@prisma/client';
import { Router } from 'express';
/*
   Levels
   Levels endpoints for Auxdibot
*/
const levels = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/levels',
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
               select: {
                  serverID: true,
                  level_channel: true,
                  level_rewards: true,
                  message_xp: true,
                  level_embed: true,
               },
            })
            .then(async (data) =>
               data
                  ? res.json({
                       ...guildData,
                       data,
                    })
                  : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/levels/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            level_channel = req.body['level_channel'];
         if (typeof level_channel != 'string' && typeof level_channel != 'undefined')
            return res.status(400).json({ error: 'this is not a valid level channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(level_channel);
         if (!channel && level_channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { level_channel: true, serverID: true },
               data: { level_channel: level_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.LEVEL_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Level Channel for this server has been changed to ${
                     channel
                        ? `#${channel.name}`
                        : 'none. Auxdibot will reply to messages that cause a user to level up.'
                  }`,
               });
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/levels/message_xp',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            messageXP = req.body['message_xp'];
         if ((typeof messageXP != 'string' && typeof messageXP != 'number') || !Number(messageXP))
            return res.status(400).json({ error: 'this is not a valid message XP count!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { message_xp: true, serverID: true },
               data: { message_xp: Number(messageXP) },
            })
            .then(async (i) => {
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/levels/embed',
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
            .findFirst({ where: { serverID: serverID }, select: { level_embed: true } })
            .then(async (data) => {
               return auxdibot.database.servers
                  .update({
                     where: { serverID },
                     select: { serverID: true, level_embed: true },
                     data: { level_embed: !data.level_embed },
                  })
                  .then(async (i) => {
                     return res.json(i);
                  });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router
      .route('/:serverID/levels/rewards')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(guildData.id);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, level_rewards: true } })
               .then(async (data) =>
                  data
                     ? res.json({
                          ...guildData,
                          data,
                       })
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
               roleID = req.body['role'],
               level = req.body['level'];
            if (typeof roleID != 'string' || (typeof level != 'string' && typeof level != 'number'))
               return res.status(400).json({ error: 'this is not a valid level reward!' });
            const guildData = req.user.guilds.find((i) => i.id == serverID),
               guild = auxdibot.guilds.cache.get(serverID);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });
            const role = guild.roles.cache.get(roleID);
            if (!role) return res.status(400).json({ error: 'invalid role' });
            if (!Number(level) || Number(level) < 1) return res.status(400).json({ error: 'invalid level' });
            return auxdibot.database.servers
               .findFirst({ where: { serverID }, select: { level_rewards: true } })
               .then((i) =>
                  !testLimit(i.level_rewards, Limits.LEVEL_REWARDS_DEFAULT_LIMIT)
                     ? res.status(403).json({ error: 'you have too many level rewards' })
                     : auxdibot.database.servers
                          .update({
                             where: { serverID },
                             select: { serverID: true, suggestions_reactions: true },
                             data: { level_rewards: { push: { level: Number(level), roleID: role.id } } },
                          })
                          .then((i) =>
                             i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
                          )
                          .catch((x) => {
                             console.error(x);
                             return res.status(500).json({ error: 'an error occurred' });
                          }),
               );
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID,
               index = req.body['index'];
            if (typeof index != 'number' && typeof index != 'string')
               return res.status(400).json({ error: 'This is not a valid index!' });
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });
            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { level_rewards: true } })
               .then(async (data) => {
                  if (!data) return res.status(404).json({ error: "couldn't find that server" });
                  if (data.level_rewards.length < Number(index))
                     return res.status(400).json({ error: 'invalid index provided' });
                  const reward = data.level_rewards[index];
                  data.level_rewards.splice(Number(index), 1);
                  return await auxdibot.database.servers
                     .update({
                        where: { serverID: serverID },
                        data: { level_rewards: data.level_rewards },
                     })
                     .then(() => res.json(reward));
               })
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default levels;
