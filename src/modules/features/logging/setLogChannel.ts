import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function setLogChannel(auxdibot: Auxdibot, guild: Guild, user: { id: string }, channel?: Channel) {
   if (channel && (channel.type == ChannelType.DM || channel.type != ChannelType.GuildText))
      throw new Error('This is not a valid log channel!');
   if (channel && 'guildId' in channel && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { log_channel: true, serverID: true },
         data: { log_channel: channel?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.LOG_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Log Channel for this server has been changed to ${
               channel && channel.type != ChannelType.DM
                  ? `#${channel.name}`
                  : 'none. Logs are now disabled for this server.'
            }`,
         });
         return i;
      });
}
