import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction } from '@prisma/client';
import { Guild } from 'discord.js';

export default async function deleteChannelMultiplier(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   id: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.channel_multipliers.length <= id) throw new Error('Invalid id provided.');

   const multiplier = server.channel_multipliers.splice(id, 1);
   return await auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: { channel_multipliers: server.channel_multipliers },
         select: { channel_multipliers: true },
      })
      .then((data) => {
         auxdibot.log(guild, {
            type: LogAction.MULTIPLIER_DELETED,
            userID: user.id,
            date: new Date(),
            description: `Deleted the channel multiplier #${id} (in <#${multiplier[0]?.id}>) from your server.`,
         });
         return data;
      });
}
