import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Router } from 'express';
/*
   Massrole
   Massrole give/take from all users.
*/
const massrole = (auxdibot: Auxdibot, router: Router) => {
   router.route('/:serverID/massrole').post(
      (req, res, next) => checkAuthenticated(req, res, next),
      async (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         if (!req.body['roleID']) return res.status(400).json({ error: 'missing parameters' });
         const serverID = req.params.serverID,
            give = req.body['give'] === 'true';
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(guildData.id);
         if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });
         const role = guild.roles.cache.get(req.body['roleID']);
         if (!role) return res.status(400).json({ error: 'invalid role' });
         try {
            const members = await guild.members.fetch();
            members.forEach((member) => {
               if (
                  req.user.id != member.id &&
                  (!member.roles.resolve(role.id) &&
                     guild.members.me &&
                     member.roles.highest.comparePositionTo(guild.members.me.roles.highest) <= 0 &&
                     member.roles.highest.comparePositionTo(member.roles.highest)) <= 0
               ) {
                  give
                     ? member.roles.add(role.id).catch(() => undefined)
                     : member.roles.remove(role.id).catch(() => undefined);
               }
            });
            handleLog(auxdibot, guild, {
               userID: req.user.id,
               description: give
                  ? `Massrole gave ${role} to anyone with lower role hiearchy than Auxdibot.`
                  : `Massrole took ${role} from anyone who had it, with lower role hiearchy than Auxdibot.`,
               type: give ? LogAction.MASSROLE_GIVEN : LogAction.MASSROLE_TAKEN,
               date_unix: Date.now(),
            });
            return res.json({ success: 'successfully used massrole' });
         } catch (x) {
            console.log(x);
            return res.status(500).json({ error: 'an error occurred' });
         }
      },
   );
   return router;
};
export default massrole;
