import { defaultServer } from '@/constants/database/defaultServer';
import { Auxdibot } from '@/interfaces/Auxdibot';
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
         return auxdibot.database.servers
            .delete({ where: { serverID: req.guild.id } })
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
