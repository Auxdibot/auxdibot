import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { LogAction, ScheduledMessage } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function createSchedule(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string; username: string },
   scheduledMessage: ScheduledMessage,
   channel?: Channel,
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { serverID: true, scheduled_messages: true } })
      .then(async (data) => {
         if (!testLimit(data.scheduled_messages, Limits.SCHEDULE_LIMIT)) {
            throw new Error('schedules limit exceeded');
         }
         await auxdibot.database.servers.update({
            where: { serverID: guild.id },
            data: { scheduled_messages: { push: scheduledMessage } },
         });
         await handleLog(auxdibot, guild, {
            userID: user.id,
            description: `Scheduled a message for ${
               channel && channel.type != ChannelType.DM ? channel.name : 'a channel'
            }.`,
            type: LogAction.SCHEDULED_MESSAGE_CREATED,
            date: new Date(),
         });
         return scheduledMessage;
      });
}
