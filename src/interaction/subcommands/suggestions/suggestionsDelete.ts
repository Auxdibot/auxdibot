import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { GuildBasedChannel } from 'discord.js';

export const suggestionsDelete = <AuxdibotSubcommand>{
   name: 'delete',
   info: {
      module: Modules['Suggestions'],
      description: 'Delete a suggestion.',
      usageExample: '/suggestions delete (id)',
      permission: 'suggestions.delete',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const id = interaction.options.getNumber('id', true);
      const suggestion = server.suggestions.find((sugg) => sugg.suggestionID == id);
      if (!suggestion) {
         return await handleError(auxdibot, 'SUGGESTION_NOT_FOUND', "Couldn't find that suggestion!", interaction);
      }
      const message_channel: GuildBasedChannel | undefined = server.suggestions_channel
         ? interaction.data.guild.channels.cache.get(server.suggestions_channel)
         : undefined;
      const message = suggestion.messageID
         ? message_channel && message_channel.isTextBased()
            ? await message_channel.messages.fetch(suggestion.messageID)
            : await getMessage(interaction.data.guild, suggestion.messageID)
         : undefined;
      if (message) {
         const thread =
            message.thread && message.thread.id == suggestion.discussion_thread_id ? message.thread : undefined;
         if (thread) {
            await thread.setArchived(true, 'Suggestion has been deleted.').catch(() => undefined);
         }
         await message.delete().catch(() => undefined);
         await handleLog(auxdibot, interaction.data.guild, {
            userID: interaction.data.member.id,
            description: `${interaction.data.member.user.username} deleted Suggestion #${suggestion.suggestionID}`,
            type: LogAction.SUGGESTION_DELETED,
            date_unix: Date.now(),
         });
      }
      deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = 'Success';
      successEmbed.description = `Successfully deleted Suggestion #${suggestion.suggestionID}.`;
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
