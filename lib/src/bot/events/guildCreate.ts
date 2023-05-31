import { Guild } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { Auxdibot } from '@/interfaces/Auxdibot';

module.exports = {
   name: 'guildCreate',
   once: false,
   async execute(guild: Guild) {
      if (!guild) return;
      await Server.findOrCreateServer(guild.id.toString());
      const channel = guild.systemChannel;
      if (!channel) return;
      const auxdibot = guild.client as Auxdibot;
      if (auxdibot.updateDiscordStatus) await auxdibot.updateDiscordStatus();
      return await channel.send({ embeds: [auxdibot.embeds.welcome.toJSON()] });
   },
};
