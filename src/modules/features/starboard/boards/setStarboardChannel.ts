import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

import { LogAction } from '@prisma/client';
import { Channel, Guild } from 'discord.js';

export default async function setStarboardChannel(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   boardName: string,
   channel: Channel,
) {
   const server = await findOrCreateServer(auxdibot, guild.id),
      board = server.starboard_boards.find((i) => i.board_name == boardName);

   if (!board) throw new Error('Could not find the specified board!');
   if (channel && (channel.isDMBased() || !channel.isTextBased()))
      throw new Error('This is not a valid Starboard channel!');
   if (channel && !channel.isDMBased() && guild.id != channel.guildId)
      throw new Error('This channel is not in this guild!');

   board.channelID = channel.id;
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { starboard_boards: true, serverID: true },
         data: { starboard_boards: server.starboard_boards },
      })
      .then(async (i) => {
         await auxdibot.log(guild, {
            type: LogAction.STARBOARD_CHANNEL_CHANGED,
            userID: user.id,
            date: new Date(),
            description: `The channel for the starboard \`${boardName}\` has been changed to ${
               channel && !channel.isDMBased() ? `#${channel.name}` : 'none. Starboard is now disabled for this server.'
            }`,
         });
         return i;
      })
      .catch((x) => {
         console.error(x);
         throw new Error(
            'Woah! An unknown error occurred. Please contact the Auxdibot Support server to see if we can resolve this!',
         );
      });
}
