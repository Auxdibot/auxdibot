import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'record',
   permission: 'moderation.record',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await Server.findOrCreateServer(interaction.guild.id);
      const embed = await server.recordAsEmbed(user_id);
      if (!embed) return await interaction.reply({ embeds: [auxdibot.embeds.error.toJSON()] });
      return await interaction.reply({ embeds: [embed] });
   },
};
