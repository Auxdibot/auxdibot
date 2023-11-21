import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role } from 'discord.js';

export async function addAutoModException(auxdibot: Auxdibot, guild: Guild, role: Role | APIRole, userID?: string) {
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { automod_role_exceptions: { push: role.id } },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            userID,
            description: `Added ${role.name} to the AutoMod exception roles.`,
            type: LogAction.AUTOMOD_SETTINGS_CHANGE,
            date_unix: Date.now(),
         });
         return i;
      });
}
