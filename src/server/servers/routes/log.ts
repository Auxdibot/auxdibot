import { Auxdibot } from '@/interfaces/Auxdibot';
import toggleLogFilter from '@/modules/features/settings/toggleLogFilter';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { LogAction } from '@prisma/client';
import { Router } from 'express';
/*
   Log
   View the latest log on your server & the log channel.
*/
const log = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/log',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
               select: { serverID: true, logs: true, log_channel: true, filtered_logs: true },
            })
            .then(async (data) =>
               data ? res.json({ data }) : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.get(
      '/:serverID/log/actions',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
               select: { filtered_logs: true },
            })
            .then((data) => {
               if (!data) return res.status(404).json({ error: "couldn't find that server" });
               return res.json({
                  data: {
                     log_actions: Object.keys(LogAction).filter(
                        (i: string) => !(data.filtered_logs as string[]).includes(i),
                     ),
                  },
               });
            })
            .catch(() => res.status(500).json({ error: 'an error occurred' }));
      },
   );
   router.post(
      '/:serverID/log/filter',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const log = req.body['log'];
         if (!log || typeof log != 'string' || Object.keys(LogAction).indexOf(log) == -1)
            return res.status(400).json({ error: 'This is not a valid log action!' });

         return toggleLogFilter(auxdibot, req.guild, LogAction[log])
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default log;
