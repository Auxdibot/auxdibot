import { Auxdibot } from '@/interfaces/Auxdibot';
import setJoinDMEmbed from '@/modules/features/greetings/setJoinDMEmbed';
import setJoinEmbed from '@/modules/features/greetings/setJoinEmbed';
import setJoinLeaveChannel from '@/modules/features/greetings/setJoinLeaveChannel';
import setLeaveEmbed from '@/modules/features/greetings/setLeaveEmbed';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed } from '@prisma/client';
import { Router } from 'express';
/*
   Greetings
   Endpoints to manage sending greetings.
*/
const greetings = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/greetings/join').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         if (!req.body['message'] && !req.body['embed']) return res.status(400).json({ error: 'missing parameters' });
         const message = req.body['message'];

         try {
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            return setJoinEmbed(auxdibot, req.guild.id, embed, message).then((data) => res.json(data));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   router.route('/:serverID/greetings/join_DM').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         if (!req.body['message'] && !req.body['embed']) return res.status(400).json({ error: 'missing parameters' });
         const message = req.body['message'];

         try {
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            return setJoinDMEmbed(auxdibot, req.guild.id, embed, message).then((data) => res.json(data));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   router.route('/:serverID/greetings/leave').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         if (!req.body['message'] && !req.body['embed']) return res.status(400).json({ error: 'missing parameters' });
         const message = req.body['message'];

         try {
            const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
            return setLeaveEmbed(auxdibot, req.guild.id, embed, message).then((data) => res.json(data));
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   router.post(
      '/:serverID/greetings/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const new_channel = req.body['channel'];
         if (typeof new_channel != 'string' && typeof new_channel != 'undefined')
            return res.status(400).json({ error: 'this is not a valid join/leave channel!' });
         const channel = req.guild.channels.cache.get(new_channel);
         if (!channel && new_channel) return res.status(404).json({ error: 'invalid channel' });
         return setJoinLeaveChannel(auxdibot, req.guild, req.user, channel)
            .then(async (i) =>
               i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   return router;
};
export default greetings;
