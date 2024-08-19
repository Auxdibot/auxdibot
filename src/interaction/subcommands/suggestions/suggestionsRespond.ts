import Modules from '@/constants/bot/commands/Modules';
import { SuggestionStateName } from '@/constants/bot/suggestions/SuggestionStateName';
import { DEFAULT_SUGGESTION_EMBED, DEFAULT_SUGGESTION_UPDATE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import updateSuggestion from '@/modules/features/suggestions/updateSuggestion';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, SuggestionState } from '@prisma/client';
import { GuildBasedChannel, Message } from 'discord.js';

export const suggestionsRespond = <AuxdibotSubcommand>{
   name: 'respond',
   info: {
      module: Modules['Suggestions'],
      description: 'Respond to a suggestion submitted by a user.',
      usageExample: '/suggestions respond (id) (response) [reason]',
   },
   execute: async (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) => {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const id = interaction.options.getNumber('id'),
         reason = interaction.options.getString('reason'),
         stateInput = interaction.options.getString('response', true);
      const suggestion = server.suggestions.find((sugg) => sugg.suggestionID == id);
      await interaction.deferReply({ ephemeral: true });
      if (!suggestion) {
         return await handleError(auxdibot, 'SUGGESTION_NOT_FOUND', "Couldn't find that suggestion!", interaction);
      }
      const state = SuggestionState[stateInput];
      suggestion.status = SuggestionState[state];
      suggestion.handlerID = interaction.data.member.id;
      suggestion.handled_reason = reason || undefined;
      const message_channel: GuildBasedChannel | undefined = server.suggestions_channel
         ? interaction.data.guild.channels.cache.get(server.suggestions_channel)
         : undefined;
      const message = suggestion.messageID
         ? message_channel && message_channel.isTextBased()
            ? await message_channel.messages.fetch(suggestion.messageID)
            : await getMessage(interaction.data.guild, suggestion.messageID)
         : undefined;
      if (!message) {
         await deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
         return await handleError(
            auxdibot,
            'SUGGESTION_MESSAGE_NOT_FOUND',
            "Couldn't find the message for that suggestion!",
            interaction,
         );
      }
      if (server.suggestions_auto_delete) {
         await deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
         await message
            .delete()
            .then(async () => {
               if (message.hasThread) await message.thread.delete().catch(() => undefined);
            })
            .catch(() => undefined);
         await handleLog(auxdibot, interaction.data.guild, {
            userID: interaction.data.member.id,
            description: `${interaction.data.member.user.username} deleted Suggestion #${suggestion.suggestionID}`,
            type: LogAction.SUGGESTION_DELETED,
            date: new Date(),
         });
      } else {
         const update = await updateSuggestion(auxdibot, interaction.data.guild.id, suggestion);
         if (!update) {
            return await handleError(auxdibot, 'SUGGESTION_EDIT_FAILED', "Couldn't edit that suggestion!", interaction);
         }
      }
      if (server.suggestions_updates_channel) {
         const channel: GuildBasedChannel | undefined = await interaction.data.guild.channels
            .fetch(server.suggestions_updates_channel)
            .catch(() => undefined);
         if (channel && channel.isTextBased()) {
            const embed = JSON.parse(
               await parsePlaceholders(auxdibot, JSON.stringify(DEFAULT_SUGGESTION_UPDATE_EMBED), {
                  guild: interaction.data.guild,
                  member: interaction.data.member,
                  suggestion,
               }),
            );
            embed.color = auxdibot.colors.suggestions[suggestion.status];
            await channel.send({ embeds: [embed] });
         }
      } else if (!server.suggestions_auto_delete) {
         const channel: GuildBasedChannel | undefined = await interaction.data.guild.channels
            .fetch(server.suggestions_channel)
            .catch(() => undefined);
         if (channel && channel.isTextBased()) {
            const embed = JSON.parse(
               await parsePlaceholders(auxdibot, JSON.stringify(DEFAULT_SUGGESTION_EMBED), {
                  guild: interaction.data.guild,
                  member: interaction.data.member,
                  suggestion,
               }),
            );
            embed.color = auxdibot.colors.suggestions[suggestion.status];
            embed.fields?.push({
               name: 'Reason',
               value: suggestion.handled_reason ?? 'No reason given.',
            });
            const message: Message<boolean> | undefined = await channel.messages
               .fetch(suggestion.messageID)
               .catch(() => undefined);
            if (message) {
               message.edit({ embeds: [embed] }).catch(() => undefined);
            }
         }
      }
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = 'Successfully edited suggestion.';
      successEmbed.description = `The suggestion #${suggestion.suggestionID} has been updated. (Now: ${
         SuggestionStateName[suggestion.status]
      })`;
      return await interaction.editReply({ embeds: [successEmbed] });
   },
};
