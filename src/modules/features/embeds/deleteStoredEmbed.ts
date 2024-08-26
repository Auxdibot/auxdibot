import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Guild } from 'discord.js';

export async function deleteStoredEmbed(auxdibot: Auxdibot, guild: Guild, id: string) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!server.stored_embeds.find((embed) => embed.id === id)) {
      throw new Error('Embed not found');
   }
   return auxdibot.database.servers.update({
      where: {
         serverID: guild.id,
      },
      data: {
         stored_embeds: server.stored_embeds.filter((embed) => embed.id !== id),
      },
   });
}
