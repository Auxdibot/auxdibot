import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import { generateLeaderboardEmbed } from '@/modules/features/levels/generateLeaderboardEmbed';
import { generateLeaderboardCount } from '@/modules/features/levels/generateLeaderboardCount';

export default <AuxdibotButton>{
   module: Modules['Levels'],
   name: 'leaderboard',
   command: 'levels stats leaderboard',
   allowedDefault: true,
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, location, startVal] = interaction.customId.split('-');
      const total = await generateLeaderboardCount(auxdibot, interaction.guild);
      let start = startVal ? parseInt(startVal) : 0;
      switch (location) {
         case 'prev':
            if (start - 20 >= 0) start -= 20;
            break;
         case 'next':
            start += 20;
            break;
         case 'end':
            start = total - (total % 20 || 20);
            break;
         default:
            break;
      }
      console.log(start);
      const content = await generateLeaderboardEmbed(auxdibot, interaction.guild, start);

      return interaction.message
         .edit({ embeds: [content.embed], components: [content.row] })
         .then(() => {
            interaction.reply({ content: 'Leaderboard updated.', ephemeral: true }).then(() => {
               interaction.deleteReply();
            });
         })
         .catch(async (x) => {
            console.error(x);
            await handleError(
               auxdibot,
               'LEADERBOARD_GENERATE_ERROR',
               'Failed to generate leaderboard embed.',
               interaction,
            );
         });
   },
};
