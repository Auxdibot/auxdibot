import { Auxdibot } from '@/Auxdibot';
import setLogChannel from '@/modules/features/logging/setLogChannel';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Log channel
   Set the log channel for your server
*/
const logChannel = (auxdibot: Auxdibot, router: Router) => {
   router.post(
      '/:serverID/log_channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const new_log_channel = req.body['new_log_channel'];
         if (typeof new_log_channel != 'string' && typeof new_log_channel != 'undefined')
            return res.status(400).json({ error: 'this is not a valid log channel!' });
         const channel = req.guild.channels.cache.get(new_log_channel);
         if (!channel && new_log_channel) return res.status(404).json({ error: 'invalid channel' });
         return setLogChannel(auxdibot, req.guild, req.user, channel)
            .then(async (i) => {
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   return router;
};
export default logChannel;
