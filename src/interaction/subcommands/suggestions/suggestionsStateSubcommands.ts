import Modules from '@/constants/bot/commands/Modules';
import { SuggestionStateName } from '@/constants/bot/suggestions/SuggestionStateName';
import { DEFAULT_SUGGESTION_UPDATE_EMBED } from '@/constants/embeds/DefaultEmbeds';
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
import { GuildBasedChannel } from 'discord.js';

async function stateCommand(
   auxdibot: Auxdibot,
   interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>,
   state: SuggestionState,
) {
   if (!interaction.data) return;
   const server = interaction.data.guildData;
   const id = interaction.options.getNumber('id'),
      reason = interaction.options.getString('reason');
   const suggestion = server.suggestions.find((sugg) => sugg.suggestionID == id);
   if (!suggestion) {
      return await handleError(auxdibot, 'SUGGESTION_NOT_FOUND', "Couldn't find that suggestion!", interaction);
   }

   suggestion.status = state;
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
      deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
      return await handleError(
         auxdibot,
         'SUGGESTION_MESSAGE_NOT_FOUND',
         "Couldn't find the message for that suggestion!",
         interaction,
      );
   }
   if (server.suggestions_auto_delete) {
      deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
      await message.delete().catch(() => undefined);
      await handleLog(auxdibot, interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `${interaction.data.member.user.username} deleted Suggestion #${suggestion.suggestionID}`,
         type: LogAction.SUGGESTION_DELETED,
         date_unix: Date.now(),
      });
   } else {
      const update = await updateSuggestion(auxdibot, interaction.data.guild.id, suggestion);
      if (!update) {
         return await handleError(auxdibot, 'SUGGESTION_EDIT_FAILED', "Couldn't edit that suggestion!", interaction);
      }
   }
   if (server.suggestions_updates_channel) {
      const channel = interaction.data.guild.channels.cache.get(server.suggestions_updates_channel);
      if (channel && channel.isTextBased()) {
         const embed = JSON.parse(
            await parsePlaceholders(
               auxdibot,
               JSON.stringify(DEFAULT_SUGGESTION_UPDATE_EMBED),
               interaction.data.guild,
               interaction.data.member,
               suggestion,
            ),
         );
         embed.color = auxdibot.colors.suggestions[suggestion.status];
         await channel.send({ embeds: [embed] });
      }
   }
   const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
   successEmbed.title = 'Successfully edited suggestion.';
   successEmbed.description = `The suggestion #${suggestion.suggestionID} has been updated. (Now: ${
      SuggestionStateName[suggestion.status]
   })`;
   return await interaction.reply({ embeds: [successEmbed], ephemeral: true });
}

export const approveSuggestion = <AuxdibotSubcommand>{
   name: 'approve',
   info: {
      module: Modules['Suggestions'],
      description: 'Mark a suggestion as approved.',
      usageExample: '/suggestions approve (id)',
      permission: 'suggestions.state.approve',
   },
   execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
      stateCommand(auxdibot, interaction, SuggestionState.APPROVED),
};
export const denySuggestion = <AuxdibotSubcommand>{
   name: 'deny',
   info: {
      module: Modules['Suggestions'],
      description: 'Mark a suggestion as denied.',
      usageExample: '/suggestions deny (id)',
      permission: 'suggestions.state.deny',
   },
   execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
      stateCommand(auxdibot, interaction, SuggestionState.DENIED),
};
export const considerSuggestion = <AuxdibotSubcommand>{
   name: 'consider',
   info: {
      module: Modules['Suggestions'],
      description: 'Mark a suggestion as considered.',
      usageExample: '/suggestions consider (id)',
      permission: 'suggestions.state.consider',
   },
   execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
      stateCommand(auxdibot, interaction, SuggestionState.CONSIDERED),
};
export const addSuggestion = <AuxdibotSubcommand>{
   name: 'add',
   info: {
      module: Modules['Suggestions'],
      description: 'Mark a suggestion as added.',
      usageExample: '/suggestions add (id)',
      permission: 'suggestions.state.add',
   },
   execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
      stateCommand(auxdibot, interaction, SuggestionState.ADDED),
};
