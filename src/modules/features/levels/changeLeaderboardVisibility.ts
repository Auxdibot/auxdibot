import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Guild } from 'discord.js';

export default async function changeLeaderboardVisibility(auxdibot: Auxdibot, guild: Guild, visibility?: boolean) {
   if (visibility === undefined) {
      visibility = !((await findOrCreateServer(auxdibot, guild.id))?.publicize_leaderboard ?? false);
   }
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { serverID: true, publicize_leaderboard: true },
         data: { publicize_leaderboard: visibility },
      })
      .catch(() => {
         throw new Error('Failed to update the leaderboard visibility for this server!');
      });
}
