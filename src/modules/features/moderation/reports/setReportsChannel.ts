import { Auxdibot } from '@/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function setReportsChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   console.log(channel);
   if (channel && !('guild' in channel)) throw new Error('This is not a valid reports channel!');
   if (channel && 'guild' in channel && channel.guild.id != guild.id)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { reports_channel: true, serverID: true },
         data: { reports_channel: channel?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.REPORTS_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Reports Channel for this server has been changed to ${
               channel && channel.type != ChannelType.DM
                  ? `#${channel.name}`
                  : 'none. Reports are now disabled for this server.'
            }`,
         });
         return i;
      });
}
