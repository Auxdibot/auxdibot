import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function setSuggestionsDiscussionThreads(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   discussion_threads?: boolean,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { suggestions_discussion_threads: true } })
      .then(async (data) => {
         return auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               select: { serverID: true, suggestions_discussion_threads: true },
               data: { suggestions_auto_delete: discussion_threads || !data.suggestions_discussion_threads },
            })
            .then(async (i) => {
               await handleLog(auxdibot, guild, {
                  type: LogAction.SUGGESTIONS_THREAD_CREATION_CHANGED,
                  userID: user.id,
                  date_unix: Date.now(),
                  description: `The suggestions discussion thread creation for this server has been changed. (Now: ${
                     i.suggestions_discussion_threads ? 'Create Thread.' : 'Do not create a Thread.'
                  })`,
               });
               return i;
            });
      });
}
