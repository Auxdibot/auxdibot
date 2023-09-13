import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Channel, Guild } from 'discord.js';

export default async function setSuggestionsUpdatesChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   if (channel && (channel.isDMBased() || !channel.isTextBased()))
      throw new Error('This is not a valid Suggestions Updates channel!');
   if (channel && !channel.isDMBased() && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { suggestions_updates_channel: true, serverID: true },
         data: { suggestions_updates_channel: channel?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.SUGGESTIONS_UPDATES_CHANNEL_CHANGED,
            userID: user.id,
            date_unix: Date.now(),
            description: `The Suggestions Update Channel for this server has been changed to ${
               channel && !channel.isDMBased()
                  ? `#${channel.name}`
                  : 'none. Updates will not be broadcast on this server.'
            }`,
         });
         return i;
      });
}
