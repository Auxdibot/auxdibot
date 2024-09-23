import { Auxdibot } from '@/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role } from 'discord.js';

export default async function setReportRole(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   role?: Role | APIRole,
) {
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { report_role: true, serverID: true },
         data: { report_role: role?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.REPORTS_ROLE_CHANGED,
            userID: user.id,
            date: new Date(),
            description: role
               ? `The Reports Role for this server has been changed to ${role.name}`
               : 'Reports role has been unset. No role will be mentioned when a report is created.',
         });
         return i;
      });
}
