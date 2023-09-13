import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role } from 'discord.js';

export default async function setMuteRole(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   role?: Role | APIRole,
) {
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { mute_role: true, serverID: true },
         data: { mute_role: role?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.MUTE_ROLE_CHANGED,
            userID: user.id,
            date_unix: Date.now(),
            description: role
               ? `The Mute Role for this server has been changed to ${role.name}`
               : "Mute role has been unset. This server will now use Discord's timeout system for mutes.",
         });
         return i;
      });
}
