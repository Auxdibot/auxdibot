import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import { Channel, Guild } from 'discord.js';

export default async function setSuggestionsChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   if (channel && (channel.isDMBased() || !channel.isTextBased()))
      throw new Error('This is not a valid Suggestions channel!');
   if (channel && !channel.isDMBased() && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { suggestions_channel: true, serverID: true },
         data: { suggestions_channel: channel?.id || null },
      })
      .then(async (i) => {
         await auxdibot.log(guild, {
            type: LogAction.SUGGESTIONS_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Suggestions Channel for this server has been changed to ${
               channel && !channel.isDMBased()
                  ? `#${channel.name}`
                  : 'none. Suggestions are now disabled for this server.'
            }`,
         });
         return i;
      });
}
