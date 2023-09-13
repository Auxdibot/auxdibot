import { Auxdibot } from '@/interfaces/Auxdibot';
import setMuteRole from '@/modules/features/moderation/setMuteRole';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { Router } from 'express';
/*
   Mute Role
   Change the mute role and view it for the server.
*/
const muteRole = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/mute_role')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, mute_role: true } })
               .then(async (data) =>
                  data ? res.json({ data }) : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const new_mute_role = req.body['new_mute_role'];
            const role = req.guild.roles.cache.get(new_mute_role);
            if (!role && new_mute_role) return res.status(404).json({ error: 'invalid role' });
            if (role && req.guild.roles.comparePositions(req.guild.members.me.roles.highest, role.id) <= 0)
               return res.status(500).json({ error: "role higher than auxdibot's highest role" });
            return setMuteRole(auxdibot, req.guild, req.user, role)
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
export default muteRole;
