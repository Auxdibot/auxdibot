import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function setLevelChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   if (channel && (channel.type == ChannelType.DM || channel.type != ChannelType.GuildText))
      throw new Error('This is not a valid Join/Leave channel!');
   if (channel && 'guildId' in channel && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { level_channel: true, serverID: true },
         data: { level_channel: channel?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.LEVEL_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Level channel for this server has been changed to ${
               channel && channel.type != ChannelType.DM
                  ? `#${channel.name}`
                  : 'none. Auxdibot will reply to messages that cause a user to level up.'
            }`,
         });
         return i;
      });
}
