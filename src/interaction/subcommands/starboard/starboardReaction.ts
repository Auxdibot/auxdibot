import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardReaction from '@/modules/features/starboard/setStarboardReaction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardReaction = <AuxdibotSubcommand>{
   name: 'reaction',
   info: {
      module: Modules['Starboard'],
      description: 'Set the starboard reaction for this server.',
      usageExample: '/starboard reaction (reaction)',
      permission: 'starboard.settings.reaction',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const reaction = interaction.options.getString('reaction', true);
      setStarboardReaction(auxdibot, interaction.guild, interaction.user, reaction)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Set ${reaction} as the starboard reaction.`;
            return await interaction.reply({ embeds: [successEmbed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'STARBOARD_REACTION_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the starboard reaction!",
               interaction,
            );
         });
   },
};
