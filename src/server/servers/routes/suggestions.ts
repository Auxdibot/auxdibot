import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction } from '@prisma/client';
import emojiRegex from 'emoji-regex';
import { Router } from 'express';
/*
   Suggestions
   Suggestions endpoints for Auxdibot
*/
const suggestions = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/suggestions',
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
                  suggestions_channel: true,
                  suggestions_discussion_threads: true,
                  suggestions_auto_delete: true,
                  suggestions_reactions: true,
                  suggestions_updates_channel: true,
                  suggestions: true,
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
      '/:serverID/suggestions/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            suggestions_channel = req.body['suggestions_channel'];
         if (typeof suggestions_channel != 'string' && typeof suggestions_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid suggestions channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(suggestions_channel);
         if (!channel && suggestions_channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { suggestions_channel: true, serverID: true },
               data: { suggestions_channel: suggestions_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.SUGGESTIONS_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Suggestions Channel for this server has been changed to ${
                     channel ? `#${channel.name}` : 'none. Suggestions are now disabled for this server.'
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
      '/:serverID/suggestions/updates_channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            suggestions_update_channel = req.body['suggestions_update_channel'];
         if (typeof suggestions_update_channel != 'string' && typeof suggestions_update_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid suggestions update channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(suggestions_update_channel);
         if (!channel && suggestions_update_channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { suggestions_updates_channel: true, serverID: true },
               data: { suggestions_updates_channel: suggestions_update_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.SUGGESTIONS_UPDATES_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Suggestions Update Channel for this server has been changed to ${
                     channel ? `#${channel.name}` : 'none. Updates will not be broadcast on this server.'
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
      '/:serverID/suggestions/auto_delete',
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
            .findFirst({ where: { serverID: serverID }, select: { suggestions_auto_delete: true } })
            .then(async (data) => {
               return auxdibot.database.servers
                  .update({
                     where: { serverID },
                     select: { serverID: true, suggestions_auto_delete: true },
                     data: { suggestions_auto_delete: !data.suggestions_auto_delete },
                  })
                  .then(async (i) => {
                     await handleLog(auxdibot, guild, {
                        type: LogAction.SUGGESTIONS_AUTO_DELETE_CHANGED,
                        userID: req.user.id,
                        date_unix: Date.now(),
                        description: `The suggestions auto deletion for this server has been changed. (Now: ${
                           i.suggestions_auto_delete ? 'Delete' : 'Do not Delete'
                        })`,
                     });
                     return res.json(i);
                  });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/suggestions/discussion_threads',
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
            .findFirst({ where: { serverID: serverID }, select: { suggestions_discussion_threads: true } })
            .then(async (data) => {
               return auxdibot.database.servers
                  .update({
                     where: { serverID },
                     select: { serverID: true, suggestions_discussion_threads: true },
                     data: { suggestions_discussion_threads: !data.suggestions_discussion_threads },
                  })
                  .then(async (i) => {
                     await handleLog(auxdibot, guild, {
                        type: LogAction.SUGGESTIONS_THREAD_CREATION_CHANGED,
                        userID: req.user.id,
                        date_unix: Date.now(),
                        description: `The suggestions auto deletion for this server has been changed. (Now: ${
                           i.suggestions_discussion_threads ? 'Create Thread.' : 'Do not create a Thread.'
                        })`,
                     });
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
      .route('/:serverID/suggestions/reactions')
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
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, suggestions_reactions: true } })
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
               reaction = req.body['suggestion_reaction'];
            if (typeof reaction != 'string')
               return res.status(400).json({ error: 'this is not a valid suggestion reaction!' });
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });
            const regex = emojiRegex();
            const emojis = reaction.match(regex);
            const emoji =
               auxdibot.emojis.cache.find((i) => i.toString() == reaction) || (emojis != null ? emojis[0] : null);
            if (!emoji) return res.status(400).json({ error: 'invalid emoji' });
            return auxdibot.database.servers
               .findFirst({ where: { serverID }, select: { suggestions_reactions: true } })
               .then((i) =>
                  !testLimit(i.suggestions_reactions, Limits.SUGGESTIONS_REACTIONS_DEFAULT_LIMIT)
                     ? res.status(403).json({ error: 'you have too many suggestions reactions' })
                     : auxdibot.database.servers
                          .update({
                             where: { serverID },
                             select: { serverID: true, suggestions_reactions: true },
                             data: { suggestions_reactions: { push: reaction } },
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
               .findFirst({ where: { serverID: serverID }, select: { suggestions_reactions: true } })
               .then(async (data) => {
                  if (!data) return res.status(404).json({ error: "couldn't find that server" });
                  if (data.suggestions_reactions.length < Number(index))
                     return res.status(400).json({ error: 'invalid index provided' });
                  const schedule = data.suggestions_reactions[index];
                  data.suggestions_reactions.splice(Number(index), 1);
                  return await auxdibot.database.servers
                     .update({
                        where: { serverID: serverID },
                        data: { suggestions_reactions: data.suggestions_reactions },
                     })
                     .then(() => res.json(schedule));
               })
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default suggestions;
