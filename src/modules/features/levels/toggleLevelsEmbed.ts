import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Guild } from 'discord.js';

export default async function toggleLevelsEmbed(auxdibot: Auxdibot, guild: Guild) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { serverID: true, level_embed: true },
         data: { level_embed: !server.level_embed },
      })
      .catch(() => {
         throw new Error('Failed to update the levels embed for this server!');
      });
}
