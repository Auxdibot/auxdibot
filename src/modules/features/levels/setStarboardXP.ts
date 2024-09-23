import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function setStarboardXP(auxdibot: Auxdibot, guild: Guild, starboardXP: number[]) {
   if (starboardXP.length > 2 || starboardXP.length <= 0)
      throw new Error('You must define one or two values for the Starboard XP range.');
   if (starboardXP.find((i) => !Number.isInteger(i) || i < 0))
      throw new Error('The Starboard XP range must be a positive integer.');
   if (Number.isNaN(starboardXP.find((i) => isNaN(i))))
      throw new Error('The Starboard XP range must be a valid number.');
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { starboard_xp_range: true, serverID: true },
      data: { starboard_xp_range: starboardXP },
   });
}
