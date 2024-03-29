import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setSuggestionsAutoDelete from '@/modules/features/suggestions/setSuggestionsAutoDelete';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const suggestionsAutoDelete = <AuxdibotSubcommand>{
   name: 'auto_delete',
   info: {
      module: Modules['Suggestions'],
      description: 'Set whether suggestions are deleted upon being approved, denied, or marked as added.',
      usageExample: '/suggestions auto_delete (true|false)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const deleteBool = interaction.options.getBoolean('delete', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Suggestions Auto Delete Changed';
      const deleteSuggestions = server.suggestions_auto_delete;
      if (deleteBool == deleteSuggestions) {
         embed.description = `Nothing changed. Auto delete is the same as settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      setSuggestionsAutoDelete(auxdibot, interaction.guild, interaction.user, deleteBool)
         .then(async () => {
            embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${
               deleteSuggestions ? 'Delete' : 'Do not Delete'
            }\r\n\r\nNow: ${deleteBool ? 'Delete' : 'Do not Delete'}`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SUGGESTION_AUTO_DELETE_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the suggestions auto delete!",
               interaction,
            );
         });
   },
};
