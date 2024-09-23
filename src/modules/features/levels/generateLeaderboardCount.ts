import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export async function generateLeaderboardCount(auxdibot: Auxdibot, guild: Guild) {
   return auxdibot.database.servermembers
      .count({
         where: { serverID: guild.id, in_server: true },
      })
      .catch(() => -1);
}
