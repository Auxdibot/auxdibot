import { Channel, ChannelType } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

export default async function channelCreate(auxdibot: Auxdibot, channel: Channel) {
   if (channel.type == ChannelType.DM || channel.type == ChannelType.GroupDM) return;
   await handleLog(auxdibot, channel.guild, {
      type: LogAction.CHANNEL_CREATED,
      date: new Date(),
      description: `A channel named #${channel.name} was created on your server.`,
      userID: auxdibot.user.id,
   });
}
