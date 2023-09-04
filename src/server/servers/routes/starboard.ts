import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import emojiRegex from 'emoji-regex';
import { Router } from 'express';
/*
   Starboard
   Starboard endpoints for Auxdibot
*/
const starboard = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/starboard',
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
                  starboard_channel: true,
                  starboard_reaction: true,
                  starboard_reaction_count: true,
                  total_starred_messages: true,
                  total_stars: true,
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
      '/:serverID/starboard/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            starboard_channel = req.body['starboard_channel'];
         if (typeof starboard_channel != 'string' && typeof starboard_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid starboard channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(starboard_channel);
         if (!channel && starboard_channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { starboard_channel: true, serverID: true },
               data: { starboard_channel: starboard_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.STARBOARD_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Starboard Channel for this server has been changed to ${
                     channel ? `#${channel.name}` : 'none. Starboard is now disabled for this server.'
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
      '/:serverID/starboard/reaction',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            reaction = req.body['starboard_reaction'];
         if (typeof reaction != 'string')
            return res.status(400).json({ error: 'This is not a valid starboard reaction!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const regex = emojiRegex();
         const emojis = reaction.match(regex);
         const emoji =
            auxdibot.emojis.cache.find((i) => i.toString() == reaction) || (emojis != null ? emojis[0] : null);
         if (!emoji) return res.status(400).json({ error: 'invalid emoji' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { starboard_reaction_count: true, starboard_reaction: true, serverID: true },
               data: { starboard_reaction: emoji.toString() },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.STARBOARD_REACTION_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Starboard reaction for this server has been changed to ${i.starboard_reaction}`,
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
      '/:serverID/starboard/reaction_count',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            reaction_count = req.body['reaction_count'];
         if (typeof reaction_count != 'string' || !Number(reaction_count))
            return res.status(400).json({ error: 'This is not a valid starboard reaction count!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { starboard_reaction_count: true, starboard_reaction: true, serverID: true },
               data: { starboard_reaction_count: Number(reaction_count) },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.STARBOARD_REACTION_COUNT_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Starboard reaction count for this server has been changed to ${
                     i.starboard_reaction_count + ' ' + i.starboard_reaction
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
   return router;
};
export default starboard;
