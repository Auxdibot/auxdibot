import { Auxdibot } from '@/Auxdibot';
import { Guild } from 'discord.js';

export default async function setVoiceXP(auxdibot: Auxdibot, guild: Guild, voiceXP: number[]) {
   if (voiceXP.length > 2 || voiceXP.length <= 0)
      throw new Error('You must define one or two values for the Voice XP range.');
   if (voiceXP.find((i) => !Number.isInteger(i) || i < 0))
      throw new Error('The Voice XP range must be a positive integer.');
   if (Number.isNaN(voiceXP.find((i) => isNaN(i)))) throw new Error('The Voice XP range must be a valid number.');
   return auxdibot.database.servers.update({
      where: { serverID: guild.id },
      select: { voice_xp_range: true, serverID: true },
      data: { voice_xp_range: voiceXP },
   });
}
