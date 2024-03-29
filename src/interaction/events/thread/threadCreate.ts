import { ThreadChannel } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

export default async function threadCreate(auxdibot: Auxdibot, thread: ThreadChannel, newlyCreated: boolean) {
   if (!newlyCreated) return;
   await handleLog(auxdibot, thread.guild, {
      type: LogAction.THREAD_CREATED,
      date_unix: Date.now(),
      description: `A thread named "${thread.name}" was created on your server.`,
      userID: auxdibot.user.id,
   });
}
