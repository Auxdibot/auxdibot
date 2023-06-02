import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import userRecordAsEmbed from '@/modules/features/moderation/userRecordAsEmbed';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'record',
   permission: 'moderation.record',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const embed = await userRecordAsEmbed(auxdibot, interaction.guild.id, user_id);
      if (!embed) return await interaction.reply({ embeds: [auxdibot.embeds.error.toJSON()] });
      return await interaction.reply({ embeds: [embed] });
   },
};
