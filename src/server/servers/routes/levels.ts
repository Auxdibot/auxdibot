import { Auxdibot } from '@/interfaces/Auxdibot';
import createLevelReward from '@/modules/features/levels/createLevelReward';
import deleteLevelReward from '@/modules/features/levels/deleteLevelReward';
import setLevelChannel from '@/modules/features/levels/setLevelChannel';
import setMessageXP from '@/modules/features/levels/setMessageXP';
import toggleLevelsEmbed from '@/modules/features/levels/toggleLevelsEmbed';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Levels
   Levels endpoints for Auxdibot
*/

const levels = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/levels',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
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
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const level_channel = req.body['level_channel'];
         if (typeof level_channel != 'string' && typeof level_channel != 'undefined')
            return res.status(400).json({ error: 'this is not a valid level channel!' });

         const channel = req.guild.channels.cache.get(level_channel);
         if (!channel && level_channel) return res.status(404).json({ error: 'invalid channel' });
         return setLevelChannel(auxdibot, req.guild, req.user, channel)
            .then(async (i) => {
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/levels/message_xp',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const messageXP = req.body['message_xp'];
         if ((typeof messageXP != 'string' && typeof messageXP != 'number') || !Number(messageXP))
            return res.status(400).json({ error: 'this is not a valid message XP count!' });
         const xp = Math.round(Number(messageXP));
         if (xp < 0) return res.status(400).json({ error: 'xp must be greater than zero' });
         return setMessageXP(auxdibot, req.guild, Math.round(Number(messageXP)) || undefined)
            .then(async (i) => {
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/levels/embed',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return toggleLevelsEmbed(auxdibot, req.guild)
            .then(async (i) => res.json(i))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router
      .route('/:serverID/levels/rewards')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, level_rewards: true } })
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
      )
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'],
               level = req.body['level'];
            if (typeof roleID != 'string' || (typeof level != 'string' && typeof level != 'number'))
               return res.status(400).json({ error: 'this is not a valid level reward!' });
            const role = req.guild.roles.cache.get(roleID);
            if (!role) return res.status(400).json({ error: 'invalid role' });
            if (!Number(level) || Number(level) < 1) return res.status(400).json({ error: 'invalid level' });
            return createLevelReward(auxdibot, req.guild, req.user, { level: Number(level), roleID: role.id })
               .then((i) =>
                  i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
               )
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
            return deleteLevelReward(auxdibot, req.guild, Number(index))
               .then((i) =>
                  i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      );
   return router;
};
export default levels;
