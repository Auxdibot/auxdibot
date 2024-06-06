import { Auxdibot } from '@/interfaces/Auxdibot';
import addSuggestionsReaction from '@/modules/features/suggestions/addSuggestionsReaction';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import deleteSuggestionsReaction from '@/modules/features/suggestions/deleteSuggestionsReaction';
import setSuggestionsAutoDelete from '@/modules/features/suggestions/setSuggestionsAutoDelete';
import setSuggestionsChannel from '@/modules/features/suggestions/setSuggestionsChannel';
import setSuggestionsDiscussionThreads from '@/modules/features/suggestions/setSuggestionsDiscussionThreads';
import setSuggestionsUpdatesChannel from '@/modules/features/suggestions/setSuggestionsUpdatesChannel';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Suggestions
   Suggestions endpoints for Auxdibot
*/
const suggestions = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/suggestions',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
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
               data ? res.json(data) : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.delete(
      '/:serverID/suggestions',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         const suggestionID = req.body['id'];
         if (!Number.isInteger(Number(suggestionID)))
            return res.status(400).json({ error: 'This is not a valid suggestion ID!' });
         const server = await findOrCreateServer(auxdibot, req.guild.id);
         const suggestion = server.suggestions.find((sugg) => sugg.suggestionID == Number(suggestionID));
         if (!suggestion) return res.status(404).json({ error: 'invalid suggestion' });
         const channel = req.guild.channels.cache.get(server.suggestions_channel);
         if (!channel) return res.status(404).json({ error: 'There is no suggestions channel!' });
         const msg = await channel.messages.fetch(suggestion.messageID).catch(() => undefined);
         if (msg) await msg.delete().catch(() => undefined);
         return deleteSuggestion(auxdibot, req.guild.id, Number(suggestionID))
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/suggestions/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const suggestions_channel = req.body['suggestions_channel'];
         if (typeof suggestions_channel != 'string' && typeof suggestions_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid suggestions channel!' });
         const channel = req.guild.channels.cache.get(suggestions_channel);
         if (!channel && suggestions_channel) return res.status(404).json({ error: 'invalid channel' });
         return setSuggestionsChannel(auxdibot, req.guild, req.user, channel)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/suggestions/updates_channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const suggestions_update_channel = req.body['suggestions_update_channel'];
         if (typeof suggestions_update_channel != 'string' && typeof suggestions_update_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid suggestions update channel!' });
         const channel = req.guild.channels.cache.get(suggestions_update_channel);
         if (!channel && suggestions_update_channel) return res.status(404).json({ error: 'invalid channel' });
         return setSuggestionsUpdatesChannel(auxdibot, req.guild, req.user, channel)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/suggestions/auto_delete',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return setSuggestionsAutoDelete(auxdibot, req.guild, req.user)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/suggestions/discussion_threads',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return setSuggestionsDiscussionThreads(auxdibot, req.guild, req.user)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router
      .route('/:serverID/suggestions/reactions')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({
                  where: { serverID: req.guild.id },
                  select: { serverID: true, suggestions_reactions: true },
               })
               .then(async (data) =>
                  data
                     ? res.json({
                          data,
                       })
                     : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const reaction = req.body['suggestion_reaction'];
            if (typeof reaction != 'string')
               return res.status(400).json({ error: 'this is not a valid suggestion reaction!' });
            return addSuggestionsReaction(auxdibot, req.guild, req.user, reaction)
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  console.error(x);
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const index = req.body['index'];
            if (typeof index != 'number' && typeof index != 'string')
               return res.status(400).json({ error: 'This is not a valid index!' });
            return deleteSuggestionsReaction(auxdibot, req.guild, Number(index))
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default suggestions;
