import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardReactionCount from '@/modules/features/starboard/setStarboardReactionCount';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardReactionCount = <AuxdibotSubcommand>{
   name: 'reaction_count',
   info: {
      module: Modules['Starboard'],
      description: 'Set the starboard reaction count for this server.',
      usageExample: '/starboard reaction_count (reaction_count)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const reaction_count = interaction.options.getNumber('reaction_count', true);
      if (reaction_count <= 0) {
         return await handleError(
            auxdibot,
            'REACTION_COUNT_INVALID',
            'The reaction count cannot be negative or zero!',
            interaction,
         );
      }
      if (server.starboard_reaction_count == reaction_count) {
         return await handleError(
            auxdibot,
            'REACTION_COUNT_INDENTICAL',
            'The reaction count specified is the same as the current starboard reaction count!',
            interaction,
         );
      }
      setStarboardReactionCount(auxdibot, interaction.guild, interaction.user, Number(reaction_count))
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Set ${reaction_count} as the starboard reaction count. When a message is reacted with the starboard reaction ${reaction_count} times, it will be added to the starboard.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'STARBOARD_REACTION_COUNT_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the starboard reaction count!",
               interaction,
            );
         });
   },
};
