import { Auxdibot } from '@/interfaces/Auxdibot';
import massroleMembers from '@/modules/features/massrole/massroleMembers';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Massrole
   Massrole give/take from all users.
*/
const massrole = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/massrole').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         if (!req.body['roleID']) return res.status(400).json({ error: 'missing parameters' });
         const give = req.body['give'] === 'true';
         const role = req.guild.roles.cache.get(req.body['roleID']);
         if (!role) return res.status(400).json({ error: 'invalid role' });
         return massroleMembers(auxdibot, req.guild, role, give, req.user)
            .then(() => res.json({ success: 'successfully used massrole' }))
            .catch((x) => {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default massrole;
