import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function setEventXP(auxdibot: Auxdibot, guild: Guild, eventXP: number[]) {
   if (eventXP.length > 2 || eventXP.length <= 0)
      throw new Error('You must define one or two values for the Event XP range.');
   if (eventXP.find((i) => !Number.isInteger(i) || i < 0))
      throw new Error('The Event XP range must be a positive integer.');
   if (Number.isNaN(eventXP.find((i) => isNaN(i)))) throw new Error('The Event XP range must be a valid number.');
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { event_xp_range: true, serverID: true },
      data: { event_xp_range: eventXP },
   });
}
