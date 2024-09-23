import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardReaction from '@/modules/features/starboard/boards/setStarboardReaction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardReaction = <AuxdibotSubcommand>{
   name: 'reaction',
   group: 'board',
   info: {
      module: Modules['Starboard'],
      description: 'Set the starboard reaction for this server.',
      usageExample: '/starboard board reaction (name) (reaction)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const reaction = interaction.options.getString('reaction', true),
         boardName = interaction.options.getString('name', true);

      setStarboardReaction(auxdibot, interaction.guild, interaction.user, boardName, reaction)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Starboard Reaction Changed';
            embed.description = `Set ${reaction} as the reaction for the \`${boardName}\` board.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(auxdibot, 'STARBOARD_REACTION_SET_ERROR', x, interaction);
         });
   },
};
