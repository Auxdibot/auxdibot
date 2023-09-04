import { Auxdibot } from '@/interfaces/Auxdibot';
import deletePunishment from '@/modules/features/moderation/deletePunishment';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Router } from 'express';
/*
   Punishments
   Get all punishments, or delete a punishment
*/
const punishments = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/punishments').get(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            limit = req.query['limit'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return auxdibot.database.servers
            .findFirst({ where: { serverID: serverID }, select: { serverID: true, punishments: true } })
            .then(async (data) =>
               data
                  ? res.json({
                       ...guildData,
                       data: {
                          punishments: data.punishments.reverse().slice(0, Number(limit) || data.punishments.length),
                       },
                    })
                  : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.route('/:serverID/punishments/:punishmentID').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            punishmentID = req.params.punishmentID;
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return deletePunishment(auxdibot, guildData.id, Number(punishmentID))
            .then(async (data) => {
               await handleLog(
                  auxdibot,
                  guild,
                  {
                     type: LogAction.PUNISHMENT_DELETED,
                     date_unix: Date.now(),
                     userID: req.user.id,
                     description: `${req.user.username} deleted a punishment. (PID: ${data.punishmentID})`,
                  },
                  [punishmentInfoField(data)],
               );
               return data
                  ? res.json({
                       ...guildData,
                       data: {
                          deleted: data,
                       },
                    })
                  : res.status(404).json({ error: "couldn't find that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default punishments;
