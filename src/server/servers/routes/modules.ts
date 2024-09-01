import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import toggleModule from '@/modules/features/settings/toggleModule';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Modules
   Toggle and get disabled modules
*/
const modules = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/modules')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, disabled_modules: true } })
               .then(async (data) =>
                  data ? res.json({ data }) : res.status(404).json({ error: "couldn't find that server" }),
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
            const module = req.body['module'];
            if (
               !module ||
               typeof module != 'string' ||
               Object.keys(Modules).indexOf(module) == -1 ||
               !Modules[module]?.disableable
            )
               return res.status(400).json({ error: 'This is not a valid module!' });

            return toggleModule(auxdibot, req.guild, module)
               .then((i) =>
                  i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default modules;
