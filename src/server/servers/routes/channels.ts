import { Auxdibot } from '@/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Channels
   View all text channels on the server.
*/
const channels = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/channels',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const channelID = req.query['id'];
         return res.json(channelID ? req.guild.channels.cache.get(channelID.toString()) : req.guild.channels.cache);
      },
   );

   return router;
};
export default channels;
