import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
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
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, mute_role: true } })
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
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID,
               new_mute_role = req.body['new_mute_role'];
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(serverID);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });
            const role = guild.roles.cache.get(new_mute_role);
            if (!role && new_mute_role) return res.status(404).json({ error: 'invalid role' });
            if (role && guild.roles.comparePositions(guild.members.me.roles.highest, role.id) <= 0)
               return res.status(500).json({ error: "role higher than auxdibot's highest role" });
            return auxdibot.database.servers
               .update({
                  where: { serverID },
                  select: { mute_role: true, serverID: true },
                  data: { mute_role: !new_mute_role ? null : new_mute_role },
               })
               .then(async (i) => {
                  await handleLog(auxdibot, guild, {
                     type: LogAction.MUTE_ROLE_CHANGED,
                     userID: req.user.id,
                     date_unix: Date.now(),
                     description: role
                        ? `The Mute Role for this server has been changed to ${role.name}`
                        : "Mute role has been unset. This server will now use Discord's timeout system for mutes.",
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
export default muteRole;
