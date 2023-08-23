import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import { Router } from 'express';
/*
   Nick
   Nickname the bot on your server
*/
const nick = (auxdibot: Auxdibot, router: Router) => {
   router.post(
      '/:serverID/nick',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            newNickname = req.body['new_nickname'];
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(serverID);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return guild.members.me
            .setNickname(newNickname, 'Nickname changed from dashboard.')
            .then(() => res.json({ success: `nickname updated to ${newNickname}` }))
            .catch(() => res.json({ error: "couldn't update nickname" }));
      },
   );
   return router;
};
export default nick;
