import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import { Router } from 'express';
/*
   Roles
   View all roles on the server.
*/
const roles = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/roles',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return res.json(guild.roles.cache.map((value) => value));
      },
   );
   return router;
};
export default roles;
