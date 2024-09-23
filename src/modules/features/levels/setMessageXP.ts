import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function setMessageXP(auxdibot: Auxdibot, guild: Guild, messageXP: number[]) {
   if (messageXP.length > 2 || messageXP.length <= 0)
      throw new Error('You must define one or two values for the Message XP range.');
   if (messageXP.find((i) => !Number.isInteger(i) || i < 0))
      throw new Error('The Message XP range must be a positive integer.');
   if (Number.isNaN(messageXP.find((i) => isNaN(i)))) throw new Error('The Message XP range must be a valid number.');
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { message_xp_range: true, serverID: true },
      data: { message_xp_range: messageXP },
   });
}
