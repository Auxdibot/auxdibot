import { Auxdibot } from '@/interfaces/Auxdibot';
import setStarboardChannel from '@/modules/features/starboard/setStarboardChannel';
import setStarboardReaction from '@/modules/features/starboard/setStarboardReaction';
import setStarboardReactionCount from '@/modules/features/starboard/setStarboardReactionCount';
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
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const starboard_channel = req.body['starboard_channel'];
         if (typeof starboard_channel != 'string' && typeof starboard_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid starboard channel!' });
         const channel = req.guild.channels.cache.get(starboard_channel);
         if (!channel && starboard_channel) return res.status(404).json({ error: 'invalid channel' });
         return setStarboardChannel(auxdibot, req.guild, req.user, channel)
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
         if (typeof reaction != 'string')
            return res.status(400).json({ error: 'This is not a valid starboard reaction!' });
         return setStarboardReaction(auxdibot, req.guild, req.user, reaction)
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
         if (typeof reaction_count != 'string' || !Number(reaction_count))
            return res.status(400).json({ error: 'This is not a valid starboard reaction count!' });
         return setStarboardReactionCount(auxdibot, req.guild, req.user, Number(reaction_count))
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default starboard;
