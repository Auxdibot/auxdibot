import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setSuggestionsAutoDelete(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   auto_delete?: boolean,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { suggestions_auto_delete: true } })
      .then(async (data) => {
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               select: { serverID: true, suggestions_auto_delete: true },
               data: { suggestions_auto_delete: auto_delete || !data.suggestions_auto_delete },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.SUGGESTIONS_AUTO_DELETE_CHANGED,
                  userID: user.id,
                  date_unix: Date.now(),
                  description: `The suggestions auto deletion for this server has been changed. (Now: ${
                     i.suggestions_auto_delete ? 'Delete' : 'Do not Delete'
                  })`,
               });
               return i;
            });
      });
}
