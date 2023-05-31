import { Guild } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function guildCreate(guild: Guild) {
   if (!guild) return;
   await Server.findOrCreateServer(guild.id.toString());
   const channel = guild.systemChannel;
   if (!channel) return;
   const auxdibot = guild.client as Auxdibot;
   if (auxdibot.updateDiscordStatus) await auxdibot.updateDiscordStatus();
   await channel.send({ embeds: [auxdibot.embeds.welcome.toJSON()] });
}
