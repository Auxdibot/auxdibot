import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { generateLevelCard } from '@/modules/features/levels/generateLevelCard';
import handleError from '@/util/handleError';
import { verifyHex } from '@/util/verifyHex';
import { EmbedBuilder } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'bar',
   info: {
      module: Modules['User'],
      description: 'Update the progress bar color of your level card.',
      usageExample: '/level_card bar (start) (end)',
   },
   async execute(auxdibot, interaction) {
      const color1 = interaction.options.getString('start', true),
         color2 = interaction.options.getString('end', true);

      await interaction.deferReply({ ephemeral: true });
      const userData = await auxdibot.database.users.findFirst({
         where: { userID: interaction.user.id },
      });

      if (!verifyHex(color1) || !verifyHex(color2)) {
         return handleError(auxdibot, 'INVALID_HEX_CODE', 'Please provide a valid hex code.', interaction);
      }
      const preview = await generateLevelCard(interaction.user, 255, 1, {
         border: {
            color1: userData.level_card_border.split(':')[0],
            color2: userData.level_card_border.split(':')[1],
         },
         bar: { color1, color2 },
         premium: true,
      });
      return await auxdibot.database.users
         .upsert({
            where: { userID: interaction.user.id },
            create: { userID: interaction.user.id, level_card_bar: `${color1}:${color2}` },
            update: { level_card_bar: `${color1}:${color2}` },
         })
         .then(() => {
            const embed = new EmbedBuilder()
               .setColor(auxdibot.colors.accept)
               .setTitle('🖼️ Level Card Bar Updated')
               .setDescription(`Your level card progress bar has been updated to : \`${color1}\` to \`${color2}\`.`);
            return interaction.editReply({ embeds: [embed], files: [{ attachment: preview, name: 'level_card.png' }] });
         });
   },
};
