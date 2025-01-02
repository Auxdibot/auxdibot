import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction, TextInputStyle } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';

import handleError from '@/util/handleError';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'appeal',
   command: 'punishment delete',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, punishment_id] = interaction.customId.split('-');

      const punishment = await getServerPunishments(auxdibot, interaction.guildId, {
         punishmentID: Number(punishment_id),
         expired: false,
      });
      if (!punishment || punishment.length == 0) {
         interaction.message.delete().catch(() => undefined);
         return await handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'I could not find that punishment!', interaction);
      }
      const [punishmentData] = punishment;
      if (punishmentData.appeal.accepted !== null) {
         interaction.message.delete().catch(() => undefined);
         return await handleError(
            auxdibot,
            'ALREADY_APPEALED',
            'This punishment has already been appealed/denied!',
            interaction,
         );
      }
      const modal = new ModalBuilder()
         .setTitle('Appeal Punishment')
         .setCustomId(`appeal-${punishment_id}`)
         .addComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
               new TextInputBuilder()
                  .setCustomId('reason')
                  .setPlaceholder('The reason given for the appeal.')
                  .setLabel('What is the appeal reason?')
                  .setMaxLength(1000)
                  .setStyle(TextInputStyle.Paragraph),
            ),
         );
      await interaction.showModal(modal);
   },
};