import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { Channel, ChannelType, Guild } from 'discord.js';

export default async function setJoinLeaveChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   channel?: Channel,
) {
   if (channel && (channel.isDMBased() || channel.type != ChannelType.GuildText))
      throw new Error('This is not a valid Join/Leave channel!');
   if (channel && !channel.isDMBased() && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { join_leave_channel: true, serverID: true },
         data: { join_leave_channel: channel.id },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.JOIN_LEAVE_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The Join/Leave channel for this server has been changed to ${
               channel && !channel.isDMBased()
                  ? `#${channel.name}`
                  : 'none. Join/Leave greetings are now disabled on this server.'
            }`,
         });
         return i;
      });
}
