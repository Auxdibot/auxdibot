import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function setGlobalMultiplier(auxdibot: Auxdibot, guild: Guild, multiplier: number) {
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { global_multiplier: true, serverID: true },
      data: { global_multiplier: multiplier },
   });
}
