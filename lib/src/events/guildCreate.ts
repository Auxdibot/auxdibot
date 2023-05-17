import { Guild } from 'discord.js';
import Embeds from '../util/constants/Embeds';
import Server from '../mongo/model/server/Server';
import { IAuxdibot } from '../util/templates/IAuxdibot';

module.exports = {
   name: 'guildCreate',
   once: false,
   async execute(guild: Guild) {
      if (!guild) return;
      await Server.findOrCreateServer(guild.id.toString());
      const channel = guild.systemChannel;
      if (!channel) return;
      const client: IAuxdibot = guild.client;
      if (client.updateDiscordStatus) await client.updateDiscordStatus();
      return await channel.send({ embeds: [Embeds.WELCOME_EMBED.toJSON()] });
   },
};
