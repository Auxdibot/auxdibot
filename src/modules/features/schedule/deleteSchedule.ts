import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deleteSchedule(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   id: number,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { scheduled_messages: true } })
      .then(async (data) => {
         if (!data) throw new Error("couldn't find that server");
         if (data.scheduled_messages.length < id) throw new Error('invalid id provided');
         const schedule = data.scheduled_messages[id];
         data.scheduled_messages.splice(id, 1);
         await auxdibot.log(guild, {
            userID: user.id,
            description: `Deleted scheduled message #${id + 1}.`,
            type: LogAction.SCHEDULED_MESSAGE_REMOVED,
            date: new Date(),
         });
         return await auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: { scheduled_messages: data.scheduled_messages },
            })
            .then(() => schedule);
      });
}
