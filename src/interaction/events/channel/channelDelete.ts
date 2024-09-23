import { Channel } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';

export default async function channelDelete(auxdibot: Auxdibot, channel: Channel) {
   if (channel.isDMBased()) return;
   await auxdibot.log(channel.guild, {
      type: LogAction.CHANNEL_DELETED,
      date: new Date(),
      description: `A channel named #${channel.name} was deleted on your server.`,
      userID: auxdibot.user.id,
   });
}
