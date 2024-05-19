import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardSelfStar from '@/modules/features/starboard/settings/setStarboardSelfStar';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardSelfStar = <AuxdibotSubcommand>{
   name: 'self_star',
   group: 'settings',
   info: {
      module: Modules['Starboard'],
      description: 'Set whether a user can star their own messages.',
      usageExample: '/starboard settings self_star (self_star)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const selfStar = interaction.options.getBoolean('self_star', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Starboard Self Star Changed';
      const previousSelfStar = server.self_star;
      if (selfStar == previousSelfStar) {
         embed.description = `Nothing changed. Self star is the same as settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }

      setStarboardSelfStar(auxdibot, interaction.guild, interaction.user, selfStar)
         .then(async () => {
            embed.description = `The ability to self-star messages has been changed.\r\n\r\nFormerly: ${
               previousSelfStar ? 'Enabled' : 'Disabled'
            }\r\n\r\nNow: ${selfStar ? 'Enabled' : 'Disabled'}
               `;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(auxdibot, 'STARBOARD_SELF_STAR_SET_ERROR', x, interaction);
         });
   },
};
