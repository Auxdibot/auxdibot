import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setSuggestionsDiscussionThreads from '@/modules/features/suggestions/setSuggestionsDiscussionThreads';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardStarStarboard = <AuxdibotSubcommand>{
   name: 'starboard_star',
   group: 'settings',
   info: {
      module: Modules['Starboard'],
      description: 'Set whether a user can star messages directly through a starboard.',
      usageExample: '/starboard settings starboard_star (starboard_star)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const starboardStar = interaction.options.getBoolean('starboard_star', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Starboard Starboard Starring Changed';
      const previousStarboardStar = server.starboard_star;
      if (starboardStar == previousStarboardStar) {
         embed.description = `Nothing changed. Starboard starring is the same as settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }

      setSuggestionsDiscussionThreads(auxdibot, interaction.guild, interaction.user, starboardStar)
         .then(async () => {
            embed.description = `The ability to star messages directly through a starboard has been changed.\r\n\r\nFormerly: ${
               previousStarboardStar ? 'Enabled' : 'Disabled'
            }\r\n\r\nNow: ${starboardStar ? 'Enabled' : 'Disabled'}`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(auxdibot, 'STARBOARD_STARRING_SET_ERROR', x, interaction);
         });
   },
};
