import { Auxdibot } from '@/Auxdibot';
import deletePunishment from '@/modules/features/moderation/deletePunishment';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Punishments
   Get all punishments, or delete a punishment
*/
const punishments = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/punishments').get(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const limit = req.query['limit'];

         return getServerPunishments(auxdibot, req.guild.id)
            .then(async (data) =>
               data
                  ? res.json({
                       data: {
                          serverID: req.guild.id,
                          punishments: data.reverse().slice(0, Number(limit) || data.length),
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
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         const punishmentID = req.params.punishmentID;

         return deletePunishment(auxdibot, req.guild, Number(punishmentID))
            .then(async (data) => {
               return res.json({
                  data: {
                     deleted: data,
                  },
               });
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
