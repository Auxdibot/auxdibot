import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { generateLevelCard } from '@/modules/features/levels/generateLevelCard';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'preview',
   info: {
      module: Modules['User'],
      description: 'Preview your level card.',
      usageExample: '/level_card preview',
   },
   async execute(auxdibot, interaction) {
      await interaction.deferReply({ ephemeral: true });
      const userData = await auxdibot.database.users.findFirst({
         where: { userID: interaction.user.id },
      });

      const preview = await generateLevelCard(interaction.user, 255, 1, {
         border: {
            color1: userData.level_card_border?.split(':')[0],
            color2: userData.level_card_border?.split(':')[1],
         },
         bar: {
            color1: userData.level_card_bar?.split(':')[0],
            color2: userData.level_card_bar?.split(':')[1],
         },
         premium: true,
      });

      const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder().setLabel('Level Card Preview').setCustomId('dummy').setStyle(ButtonStyle.Secondary),
      );
      return auxdibot.createReply(interaction, {
         components: [components],
         files: [{ attachment: preview, name: 'level_card.png' }],
      });
   },
};
