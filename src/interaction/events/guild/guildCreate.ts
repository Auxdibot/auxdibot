import { Guild } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { promoRow } from '@/constants/bot/promoRow';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function guildCreate(auxdibot: Auxdibot, guild: Guild) {
   if (!guild) return;
   const channel = guild.systemChannel;
   if (!channel) return;
   await findOrCreateServer(auxdibot, guild.id);
   await channel.send({ embeds: [auxdibot.embeds.welcome.toJSON()], components: [promoRow.toJSON()] });
}
