import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function setStarboardXP(auxdibot: Auxdibot, guild: Guild, eventXP: number) {
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { level_channel: true, serverID: true },
      data: { level_starboard_xp: eventXP },
   });
}
