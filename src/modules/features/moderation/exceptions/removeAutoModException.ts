import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export async function removeAutoModException(
   auxdibot: Auxdibot,
   guild: Guild,
   roleID?: string,
   index?: number,
   userID?: string,
) {
   return await auxdibot.database.servers
      .findFirst({
         where: { serverID: guild.id },
      })
      .then(async (server) => {
         const roleIndex = index || server.automod_role_exceptions.indexOf(roleID);
         server.automod_role_exceptions.splice(roleIndex, 1);
         return auxdibot.database.servers
            .update({
               where: { serverID: server.serverID },
               data: { automod_role_exceptions: server.automod_role_exceptions },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  userID,
                  description: `Removed role exception #${
                     roleIndex + 1
                  } (ID: ${roleID}) from the AutoMod role exceptions.`,
                  type: LogAction.AUTOMOD_SETTINGS_CHANGE,
                  date_unix: Date.now(),
               });
               return i;
            });
      });
}
