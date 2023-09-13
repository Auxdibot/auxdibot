import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function toggleLevelsEmbed(auxdibot: Auxdibot, guild: Guild) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { level_embed: true } })
      .then((data) =>
         auxdibot.database.servers.update({
            where: { serverID: guild.id },
            select: { serverID: true, level_embed: true },
            data: { level_embed: !data.level_embed },
         }),
      );
}
