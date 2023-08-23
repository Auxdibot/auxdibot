import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Router } from 'express';
/*
   Log channel
   Set the log channel for your server
*/
const logChannel = (auxdibot: Auxdibot, router: Router) => {
   router.post(
      '/:serverID/log_channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            new_log_channel = req.body['new_log_channel'];
         if (!new_log_channel || typeof new_log_channel != 'string')
            return res.status(400).json({ error: 'This is not a valid log channel!' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const channel = guild.channels.cache.get(new_log_channel);
         if (!channel) return res.status(404).json({ error: 'invalid channel' });
         return auxdibot.database.servers
            .update({
               where: { serverID },
               select: { log_channel: true, serverID: true },
               data: { log_channel: new_log_channel },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.LOG_CHANNEL_CHANGED,
                  userID: req.user.id,
                  date_unix: Date.now(),
                  description: `The Log Channel for this server has been changed to #${channel.name}`,
               });
               return i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" });
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default logChannel;
