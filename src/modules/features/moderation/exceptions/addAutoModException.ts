import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role } from 'discord.js';

export async function addAutoModException(auxdibot: Auxdibot, guild: Guild, role: Role | APIRole, userID?: string) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!testLimit(server.automod_role_exceptions, Limits.AUTOMOD_EXCEPTION_LIMIT))
      throw new Error('You have too many role exceptions!');
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
