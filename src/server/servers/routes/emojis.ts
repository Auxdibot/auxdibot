import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Emojis
   View all emojis on the server.
*/
const emojis = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/emojis',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return res.json(req.guild.emojis.cache.filter((i) => i.available));
      },
   );
   return router;
};
export default emojis;
