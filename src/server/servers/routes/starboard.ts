import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { Auxdibot } from '@/interfaces/Auxdibot';
import createStarboard from '@/modules/features/starboard/boards/createStarboard';
import deleteStarboard from '@/modules/features/starboard/boards/deleteStarboard';
import setStarboardChannel from '@/modules/features/starboard/boards/setStarboardChannel';
import setStarboardReaction from '@/modules/features/starboard/boards/setStarboardReaction';
import setStarboardReactionCount from '@/modules/features/starboard/boards/setStarboardReactionCount';
import setStarboardSelfStar from '@/modules/features/starboard/settings/setStarboardSelfStar';
import setStarboardStarring from '@/modules/features/starboard/settings/setStarboardStarring';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Starboard
   Starboard endpoints for Auxdibot
*/
const starboard = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/starboard',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
               select: {
                  serverID: true,
                  starboard_boards: true,
                  self_star: true,
                  starboard_star: true,
               },
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
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   router
      .route('/:serverID/starboard/board')
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const board_name = req.body['board_name'];
            const channelID = req.body['channelID'];
            const reaction = req.body['reaction'];
            const count = req.body['reaction_count'];
            if (!board_name || typeof board_name != 'string')
               return res.status(400).json({ error: 'This is not a valid starboard board name!' });
            return createStarboard(auxdibot, req.guild, req.user, {
               board_name,
               channelID,
               reaction,
               count,
               star_levels: reaction == '⭐' ? defaultStarLevels : [],
            }).catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const board_name = req.body['board_name'];
            if (!board_name || typeof board_name != 'string')
               return res.status(400).json({ error: 'This is not a valid starboard board name!' });
            return deleteStarboard(auxdibot, req.guild, req.user, board_name).catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
         },
      );
   router.post(
      '/:serverID/starboard/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const starboard_channel = req.body['starboard_channel'];
         const board_name = req.body['board_name'];
         if (!board_name || typeof board_name != 'string')
            return res.status(400).json({ error: 'This is not a valid starboard board name!' });
         if (typeof starboard_channel != 'string' && typeof starboard_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid starboard channel!' });
         const channel = req.guild.channels.cache.get(starboard_channel);
         if (!channel && starboard_channel) return res.status(404).json({ error: 'invalid channel' });
         return setStarboardChannel(auxdibot, req.guild, req.user, board_name, channel)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/starboard/reaction',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const reaction = req.body['starboard_reaction'];
         const board_name = req.body['board_name'];
         if (!board_name || typeof board_name != 'string')
            return res.status(400).json({ error: 'This is not a valid starboard board name!' });
         if (typeof reaction != 'string')
            return res.status(400).json({ error: 'This is not a valid starboard reaction!' });
         return setStarboardReaction(auxdibot, req.guild, req.user, board_name, reaction)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/starboard/reaction_count',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const reaction_count = req.body['reaction_count'];
         const board_name = req.body['board_name'];
         if (!board_name || typeof board_name != 'string')
            return res.status(400).json({ error: 'This is not a valid starboard board name!' });
         if (typeof reaction_count != 'string' || !Number(reaction_count))
            return res.status(400).json({ error: 'This is not a valid starboard reaction count!' });
         return setStarboardReactionCount(auxdibot, req.guild, req.user, board_name, Number(reaction_count))
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/starboard/self_star',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return setStarboardSelfStar(auxdibot, req.guild, req.user)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/starboard/starboard_star',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return setStarboardStarring(auxdibot, req.guild, req.user)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   return router;
};
export default starboard;
