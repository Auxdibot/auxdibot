import { Guild } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { promoRow } from '@/constants/bot/PromoRow';

export default async function guildCreate(auxdibot: Auxdibot, guild: Guild) {
   if (!guild) return;
   const channel = guild.systemChannel;
   if (!channel) return;
   if (auxdibot.updateDiscordStatus) await auxdibot.updateDiscordStatus();
   await channel.send({ embeds: [auxdibot.embeds.welcome.toJSON()], components: [promoRow.toJSON()] });
}
