import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function setAppealsChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   if (channel && !('guild' in channel)) throw new Error('This is not a valid appeal channel!');
   if (channel && 'guild' in channel && channel.guild.id != guild.id)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { appeal_channel: true, serverID: true },
         data: { appeal_channel: channel?.id || null },
      })
      .then(async (i) => {
         await auxdibot.log(guild, {
            type: LogAction.APPEAL_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Appeals Channel for this server has been changed to ${
               channel && channel.type != ChannelType.DM
                  ? `#${channel.name}`
                  : 'none. Appeals are now disabled for this server.'
            }`,
         });
         return i;
      });
}
