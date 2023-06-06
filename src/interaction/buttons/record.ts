import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import userRecordAsEmbed from '@/modules/features/moderation/userRecordAsEmbed';
import handleError from '@/util/handleError';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'record',
   permission: 'moderation.record',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const embed = await userRecordAsEmbed(auxdibot, interaction.guild.id, user_id);
      if (!embed)
         return await handleError(
            auxdibot,
            'FAILED_RECORD_EMBED',
            "Couldn't generate the record embed for that user!",
            interaction,
         );
      return await interaction.reply({ embeds: [embed] });
   },
};
