import { Auxdibot } from '@/interfaces/Auxdibot';
import changeLeaderboardVisibility from '@/modules/features/levels/changeLeaderboardVisibility';
import createLevelReward from '@/modules/features/levels/createLevelReward';
import deleteLevelReward from '@/modules/features/levels/deleteLevelReward';
import setEventXP from '@/modules/features/levels/setEventXP';
import setLevelChannel from '@/modules/features/levels/setLevelChannel';
import setLevelMessage from '@/modules/features/levels/setLevelMessage';
import setMessageXP from '@/modules/features/levels/setMessageXP';
import setStarboardXP from '@/modules/features/levels/setStarboardXP';
import setVoiceXP from '@/modules/features/levels/setVoiceXP';
import toggleLevelsEmbed from '@/modules/features/levels/toggleLevelsEmbed';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed } from '@prisma/client';
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
                  message_xp_range: true,
                  event_xp_range: true,
                  level_message: true,
                  voice_xp_range: true,
                  starboard_xp_range: true,
                  level_embed: true,
                  publicize_leaderboard: true,
               },
            })
            .then(async (data) =>
               data
                  ? res.json({
                       data: {
                          ...data,
                          level_rewards: data.level_rewards.map((x, index) => ({ ...x, index })),
                       },
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
         if (typeof messageXP != 'string')
            return res.status(400).json({ error: 'This is not a valid message XP count!' });
         const xpRange = messageXP
            .toString()
            .split('-')
            .map((x) => Number(x));

         return setMessageXP(auxdibot, req.guild, xpRange)
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
      '/:serverID/levels/event_xp',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const eventXP = req.body['event_xp'];
         if (typeof eventXP != 'string') return res.status(400).json({ error: 'This is not a valid event XP count!' });
         const xpRange = eventXP
            .toString()
            .split('-')
            .map((x) => Number(x));

         return setEventXP(auxdibot, req.guild, xpRange)
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
      '/:serverID/levels/voice_xp',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const voiceXP = req.body['voice_xp'];
         if (typeof voiceXP != 'string') return res.status(400).json({ error: 'this is not a valid voice XP count!' });
         const xpRange = voiceXP
            .toString()
            .split('-')
            .map((x) => Number(x));

         return setVoiceXP(auxdibot, req.guild, xpRange)
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
      '/:serverID/levels/starboard_xp',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const starboardXP = req.body['starboard_xp'];
         if (typeof starboardXP != 'string')
            return res.status(400).json({ error: 'this is not a valid starboard XP count!' });
         const xpRange = starboardXP
            .toString()
            .split('-')
            .map((x) => Number(x));

         return setStarboardXP(auxdibot, req.guild, xpRange)
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
   router.post(
      '/:serverID/levels/leaderboard_visibility',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return changeLeaderboardVisibility(auxdibot, req.guild)
            .then(async (i) => res.json(i))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/levels/message',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const content = req.body['content'],
            embed = req.body['embed'];

         try {
            const embedJSON = embed ? (JSON.parse(embed) satisfies APIEmbed) : null;
            return setLevelMessage(auxdibot, req.guild.id, embedJSON, content)
               .then((data) => res.json({ data }))
               .catch((x) => {
                  res.status(500).json({ error: x.message });
               });
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
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
            return deleteLevelReward(auxdibot, req.guild, req.user, Number(index))
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
