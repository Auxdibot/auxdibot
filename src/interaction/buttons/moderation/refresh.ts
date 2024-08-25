import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { createUserEmbed } from '@/modules/features/moderation/createUserEmbed';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'refresh',
   command: 'user',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, user_id] = interaction.customId.split('-');
      await interaction.deferReply({ ephemeral: true });
      if (interaction.message.editable) {
         interaction.message.edit(await createUserEmbed(auxdibot, interaction.guild, user_id));
      }
      return await auxdibot.createReply(interaction, { ephemeral: true, content: 'Refreshed user data!' });
   },
};
