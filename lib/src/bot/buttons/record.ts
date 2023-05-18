import AuxdibotButton from '@util/types/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Server from '@models/server/Server';
import Embeds from '@util/constants/Embeds';
import Modules from '@util/constants/Modules';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'record',
   permission: 'moderation.record',
   async execute(interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await Server.findOrCreateServer(interaction.guild.id);
      const embed = await server.recordAsEmbed(user_id);
      if (!embed) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
      return await interaction.reply({ embeds: [embed] });
   },
};
