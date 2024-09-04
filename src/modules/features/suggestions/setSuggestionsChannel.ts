import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function setSuggestionsChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   if (channel && channel.type != ChannelType.GuildText)
      throw new Error('This is not a valid Suggestions Updates channel!');
   if (channel && 'guildId' in channel && channel.guildId != guild.id)
      throw new Error('This channel is not in this guild!');

   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { suggestions_channel: true, serverID: true },
         data: { suggestions_channel: channel?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.SUGGESTIONS_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Suggestions Channel for this server has been changed to ${
               channel && channel.type != ChannelType.DM
                  ? `#${channel.name}`
                  : 'none. Suggestions are now disabled for this server.'
            }`,
         });
         return i;
      });
}
