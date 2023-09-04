import { defaultServer } from '@/constants/database/defaultServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import { Router } from 'express';
/*
   Reset
   Reset bot settings
*/
const reset = (auxdibot: Auxdibot, router: Router) => {
   router.post(
      '/:serverID/reset',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         return auxdibot.database.servers
            .delete({ where: { serverID } })
            .then((i) =>
               i
                  ? auxdibot.database.servers
                       .create({ data: { serverID: i.serverID, ...defaultServer } })
                       .then((i) =>
                          i ? res.json({ data: i }) : res.status(500).json({ error: 'error creating server data' }),
                       )
                  : res.status(404).json({ error: 'no server found' }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default reset;
