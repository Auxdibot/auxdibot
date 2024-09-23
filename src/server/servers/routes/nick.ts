import { Auxdibot } from '@/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Nick
   Nickname the bot on your server
*/
const nick = (auxdibot: Auxdibot, router: Router) => {
   router.post(
      '/:serverID/nick',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const newNickname = req.body['new_nickname'];

         return req.guild.members.me
            .setNickname(newNickname, 'Nickname changed from dashboard.')
            .then(() => res.json({ success: `nickname updated to ${newNickname}` }))
            .catch(() => res.json({ error: "couldn't update nickname" }));
      },
   );
   return router;
};
export default nick;
