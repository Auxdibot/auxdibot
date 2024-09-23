import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import { Channel, Guild } from 'discord.js';

export default async function setLogChannel(auxdibot: Auxdibot, guild: Guild, user: { id: string }, channel?: Channel) {
   if (channel && (channel.isDMBased() || !channel.isTextBased())) throw new Error('This is not a valid log channel!');
   if (channel && !channel.isDMBased() && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { log_channel: true, serverID: true },
         data: { log_channel: channel?.id || null },
      })
      .then(async (i) => {
         await auxdibot.log(guild, {
            type: LogAction.LOG_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Log Channel for this server has been changed to ${
               channel && !channel.isDMBased() ? `#${channel.name}` : 'none. Logs are now disabled for this server.'
            }`,
         });
         return i;
      });
}
