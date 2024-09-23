import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteStarboard from '@/modules/features/starboard/boards/deleteStarboard';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardBoardDelete = <AuxdibotSubcommand>{
   name: 'delete',
   group: 'board',
   info: {
      module: Modules['Starboard'],
      description: 'Delete a starboard from this server.',
      usageExample: '/starboard board delete (name)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const boardName = interaction.options.getString('name', true);

      deleteStarboard(auxdibot, interaction.guild, interaction.user, boardName)
         .then(() => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '🗑️ Starboard Deleted';
            embed.description = `The starboard board \`${boardName}\` has been deleted.`;
            auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(auxdibot, 'STARBOARD_BOARD_DELETE_ERROR', x, interaction);
         });
   },
};
