import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
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
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, disabled_modules: true } })
               .then(async (data) =>
                  data
                     ? res.json({ ...guildData, data })
                     : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      )
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID,
               module = req.body['module'];
            if (
               !module ||
               typeof module != 'string' ||
               Object.keys(Modules).indexOf(module) == -1 ||
               !Modules[module]?.disableable
            )
               return res.status(400).json({ error: 'This is not a valid module!' });
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { disabled_modules: true } })
               .then(async (data) => {
                  if (!data) return res.status(404).json({ error: "couldn't find that server" });
                  const modules = data.disabled_modules.filter((i) => i != module);
                  if (modules.length == data.disabled_modules.length) modules.push(module);
                  return auxdibot.database.servers
                     .update({
                        where: { serverID },
                        select: { serverID: true, disabled_modules: true },
                        data: { disabled_modules: modules },
                     })
                     .then((i) =>
                        i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
                     );
               })
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default modules;
