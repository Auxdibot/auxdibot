import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardReactionCount from '@/modules/features/starboard/boards/setStarboardReactionCount';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardReactionCount = <AuxdibotSubcommand>{
   name: 'reaction_count',
   info: {
      module: Modules['Starboard'],
      description: 'Set the starboard reaction count for this server.',
      usageExample: '/starboard board reaction_count (name) (reaction_count)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const reaction_count = interaction.options.getNumber('reaction_count', true),
         boardName = interaction.options.getString('name', true);

      setStarboardReactionCount(auxdibot, interaction.guild, interaction.user, boardName, Number(reaction_count))
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Starboard Reaction Count Changed';
            embed.description = `Set ${reaction_count} as the reaction count for the \`${boardName}\` board.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(auxdibot, 'STARBOARD_REACTION_COUNT_SET_ERROR', x, interaction);
         });
   },
};
