import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import Embeds from '@/config/embeds/Embeds';
import Modules from '@/config/Modules';

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
