import { Auxdibot } from '@/interfaces/Auxdibot';
import { resetServer } from '@/modules/server/resetServer';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Reset
   Reset bot settings
*/
const reset = (auxdibot: Auxdibot, router: Router) => {
   router.post(
      '/:serverID/reset',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         if (req.guild.ownerId != req.user.id)
            return res.status(401).json({ error: 'You are not the owner of this server!' });
         return resetServer(auxdibot, req.guild)
            .then(async (i) => {
               return i ? res.json({ data: i }) : res.status(404).json({ error: 'no server found' });
            })
            .catch((x) => {
               return res.status(500).json({ error: x?.message || 'Failed to reset server.' });
            });
      },
   );
   return router;
};
export default reset;
