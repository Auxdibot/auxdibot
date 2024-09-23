import { ThreadChannel } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';

export default async function threadDelete(auxdibot: Auxdibot, thread: ThreadChannel) {
   await auxdibot.log(thread.guild, {
      type: LogAction.THREAD_DELETED,
      date: new Date(),
      description: `A thread named "${thread.name}" was deleted on your server.`,
      userID: auxdibot.user.id,
   });
}
