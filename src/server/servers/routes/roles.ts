import { Auxdibot } from '@/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Roles
   View all roles on the server.
*/
const roles = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/roles',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return res.json(req.guild.roles.cache.map((value) => value).sort((a, b) => b.position - a.position));
      },
   );
   return router;
};
export default roles;
