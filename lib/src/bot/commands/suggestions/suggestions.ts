import { EmbedBuilder, APIEmbed, ChannelType, GuildBasedChannel, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { SuggestionStateName } from '@/constants/SuggestionState';
import parsePlaceholders from '@/util/parsePlaceholder';
import emojiRegex from 'emoji-regex';
import { getMessage } from '@/util/getMessage';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, Suggestion, SuggestionState } from '@prisma/client';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import updateSuggestion from '@/modules/features/suggestions/updateSuggestion';
import { DEFAULT_SUGGESTION_EMBED, DEFAULT_SUGGESTION_UPDATE_EMBED } from '@/constants/embeds/DefaultEmbeds';
import incrementSuggestionsTotal from '@/modules/features/suggestions/incrementSuggestionsTotal';
import createSuggestion from '@/modules/features/suggestions/createSuggestion';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';

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
      const errorEmbed = auxdibot.embeds.error.toJSON();
      errorEmbed.description = "Couldn't find that suggestion!";
      return await interaction.reply({ embeds: [errorEmbed] });
   }

   suggestion.status = state;
   suggestion.handlerID = interaction.data.member.id;
   suggestion.handled_reason = reason || undefined;
   const message_channel: GuildBasedChannel | undefined = suggestion.channelID
      ? interaction.data.guild.channels.cache.get(suggestion.channelID)
      : undefined;
   const message = suggestion.messageID
      ? message_channel && message_channel.isTextBased()
         ? message_channel.messages.cache.get(suggestion.messageID)
         : await getMessage(interaction.data.guild, suggestion.messageID)
      : undefined;
   if (!message) {
      deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
      const errorEmbed = auxdibot.embeds.error.toJSON();
      errorEmbed.description = "Couldn't find the message for the suggestion!";
      return await interaction.reply({ embeds: [errorEmbed] });
   }
   if (server.suggestions_auto_delete) {
      deleteSuggestion(auxdibot, interaction.data.guild.id, suggestion.suggestionID);
      await message.delete().catch(() => undefined);
      await handleLog(auxdibot, interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `${interaction.data.member.user.tag} deleted Suggestion #${suggestion.suggestionID}`,
         type: LogAction.SUGGESTION_DELETED,
         date_unix: Date.now(),
      });
   } else {
      const update = await updateSuggestion(auxdibot, interaction.data.guild.id, suggestion);
      if (!update) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = "Couldn't edit that suggestion!";
         return await interaction.reply({ embeds: [errorEmbed] });
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
         ) as APIEmbed;
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
const suggestionsCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('suggestions')
      .setDescription('The main command for handling suggestions.')
      .addSubcommand((builder) =>
         builder
            .setName('create')
            .setDescription('Create a new suggestion.')
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('suggestion')
                  .setDescription('The suggestion you want to make for this server.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Change the channel where suggestions are posted.')
            .addChannelOption((argBuilder) =>
               argBuilder
                  .setName('channel')
                  .setDescription('The channel to post suggestions in.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('updates_channel')
            .setDescription('Change the channel where updates to suggestions are posted.')
            .addChannelOption((argBuilder) =>
               argBuilder
                  .setName('channel')
                  .setDescription('The channel to post suggestion updates in.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('auto_delete')
            .setDescription('Set whether suggestions are deleted upon being approved, denied, or marked as added.')
            .addBooleanOption((argBuilder) =>
               argBuilder
                  .setName('delete')
                  .setDescription('Whether to delete suggestions upon being approved, denied or marked as added.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('discussion_threads')
            .setDescription('Set whether a discussion thread is created when a suggestion is created.')
            .addBooleanOption((argBuilder) =>
               argBuilder
                  .setName('create_thread')
                  .setDescription('Whether a discussion thread is created when a suggestion is created.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) => builder.setName('reactions').setDescription('List the reactions for suggestions.'))
      .addSubcommand((builder) =>
         builder
            .setName('add_reaction')
            .setDescription(
               'Add a reaction to the reactions on suggestions, with a specified value for the rating given.',
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reaction').setDescription('The reaction to use ( ex. 👍)').setRequired(true),
            )
            .addNumberOption((argBuilder) =>
               argBuilder
                  .setName('rating')
                  .setDescription('The total amount to add to the rating when this is reacted to.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove_reaction')
            .setDescription('Remove a reaction from the reactions on suggestions.')
            .addStringOption((argBuilder) =>
               argBuilder.setName('reaction').setDescription('The reaction that is used ( ex. 👍)'),
            )
            .addNumberOption((argBuilder) =>
               argBuilder.setName('index').setDescription('The index of the reaction on /suggestions reactions'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('approve')
            .setDescription('Mark a suggestion as approved.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('id').setDescription('The ID of the suggestion.').setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reason').setDescription('The reason you would like to specify for this action.'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('deny')
            .setDescription('Mark a suggestion as denied.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('id').setDescription('The ID of the suggestion.').setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reason').setDescription('The reason you would like to specify for this action.'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('consider')
            .setDescription('Mark a suggestion as considered.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('id').setDescription('The ID of the suggestion.').setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reason').setDescription('The reason you would like to specify for this action.'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('add')
            .setDescription('Mark a suggestion as added.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('id').setDescription('The ID of the suggestion.').setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reason').setDescription('The reason you would like to specify for this action.'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('ban')
            .setDescription('Ban a user from using suggestions.')
            .addUserOption((argBuilder) =>
               argBuilder.setName('user').setDescription('The user to ban.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('unban')
            .setDescription('Unban a user, allowing them to use suggestions.')
            .addUserOption((argBuilder) =>
               argBuilder.setName('user').setDescription('The user to unban.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('delete')
            .setDescription('Delete a suggestion.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('id').setDescription('The ID of the suggestion.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Suggestions'],
      description: 'The main command for handling suggestions on this server.',
      usageExample:
         '/suggestions (create|channel|updates_channel|auto_delete|discussion_threads|reactions|remove_reaction|add_reaction|approve|deny|consider|add|ban|unban|delete)',
      permission: 'suggestions',
   },
   subcommands: [
      {
         name: 'create',
         info: {
            module: Modules['Suggestions'],
            description: 'Create a suggestion.',
            usageExample: '/suggestions create (suggestion)',
            permission: 'suggestions.create',
            allowedDefault: true,
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const content = interaction.options.getString('suggestion', true);
            const member = await auxdibot.database.servermembers.findFirst({
               where: { userID: interaction.data.member.id, serverID: interaction.data.guild.id },
            });
            if (member && member.suggestions_banned) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'You are banned from making suggestions!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const suggestions_channel = server.suggestions_channel
               ? await interaction.data.guild.channels.fetch(server.suggestions_channel)
               : undefined;
            if (!suggestions_channel || !suggestions_channel.isTextBased()) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description =
                  'No working suggestions channel was found! Ask an admin to enable suggestions by setting a suggestions channel.';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (server.suggestions_reactions.length < 1) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'No suggestions reactions could be found!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const suggestion = (<unknown>{
               suggestionID: await incrementSuggestionsTotal(auxdibot, interaction.data.guild.id),
               creatorID: interaction.data.member.id,
               content,
               status: SuggestionState.WAITING,
               rating: 0,
               date_unix: Date.now(),
            }) as Suggestion;
            const embed = DEFAULT_SUGGESTION_EMBED;
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Created a new suggestion (#${suggestion.suggestionID}).`;

            await interaction.reply({ ephemeral: true, embeds: [successEmbed] });
            return await suggestions_channel
               .send({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           auxdibot,
                           JSON.stringify(embed),
                           interaction.data.guild,
                           interaction.data.member,
                           suggestion,
                        ),
                     ) as APIEmbed,
                  ],
               })
               .then(async (msg) => {
                  if (!interaction.data) return;
                  server.suggestions_reactions.forEach((reaction) => msg.react(reaction));
                  suggestion.messageID = msg.id;
                  suggestion.channelID = msg.channel.id;
                  if (server.suggestions_discussion_threads) {
                     const thread = await msg
                        .startThread({
                           name: `Suggestion #${suggestion.suggestionID}`,
                           reason: 'New suggestion opened.',
                        })
                        .catch(() => undefined);
                     if (thread) suggestion.discussion_thread_id = thread.id;
                  }
                  if (
                     testLimit(interaction.data.guildData.suggestions, Limits.ACTIVE_SUGGESTIONS_DEFAULT_LIMIT, true) ==
                     'spliced'
                  ) {
                     await auxdibot.database.servers.update({
                        where: { serverID: interaction.data.guildData.serverID },
                        data: { suggestions: interaction.data.guildData.suggestions },
                     });
                  }
                  createSuggestion(auxdibot, interaction.data.guild.id, suggestion);
                  await handleLog(auxdibot, interaction.data.guild, {
                     userID: interaction.data.member.id,
                     description: `${interaction.data.member.user.tag} created Suggestion #${suggestion.suggestionID}`,
                     type: LogAction.SUGGESTION_CREATED,
                     date_unix: Date.now(),
                  });
               })
               .catch(async () => {
                  const errorEmbed = auxdibot.embeds.error.toJSON();
                  await auxdibot.database.totals.update({
                     where: { serverID: interaction.data.guild.id },
                     data: { suggestions: { decrement: 1 } },
                  });
                  errorEmbed.description = 'An error occurred trying to add this!';
                  return await interaction.reply({ embeds: [errorEmbed] });
               });
         },
      },
      {
         name: 'channel',
         info: {
            module: Modules['Suggestions'],
            description: 'Change the channel where suggestions are posted. (None to disable.)',
            usageExample: '/suggestions channel [channel]',
            permission: 'suggestions.channel',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Suggestions Channel Changed';

            const formerChannel = interaction.data.guild.channels.resolve(server.suggestions_channel || '');
            if ((channel && channel.id == server.suggestions_channel) || (!channel && !server.suggestions_channel)) {
               embed.description = `Nothing changed. Suggestions channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { suggestions_channel: channel.id },
            });
            embed.description = `The suggestions channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;

            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.SUGGESTIONS_CHANNEL_CHANGED,
                  userID: interaction.data.member.id,
                  date_unix: Date.now(),
                  description: 'The suggestions channel for this server has been changed.',
               },
               [
                  {
                     name: 'Suggestions Channel Change',
                     value: `Formerly: ${formerChannel}\n\nNow: ${channel}`,
                     inline: false,
                  },
               ],
            );
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
      {
         name: 'updates_channel',
         info: {
            module: Modules['Suggestions'],
            description: 'Change the channel where updates to suggestions are posted.',
            usageExample: '/suggestions updates_channel (channel)',
            permission: 'suggestions.channel.updates',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Suggestions Updates Channel Changed';

            const formerChannel = interaction.data.guild.channels.resolve(server.suggestions_updates_channel || '');
            if (channel && channel.id == server.suggestions_updates_channel) {
               embed.description = `Nothing changed. Suggestions updates channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { suggestions_updates_channel: channel.id },
            });
            embed.description = `The suggestions updates channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.SUGGESTIONS_UPDATES_CHANNEL_CHANGED,
                  userID: interaction.data.member.id,
                  date_unix: Date.now(),
                  description: 'The suggestions updates channel for this server has been changed.',
               },
               [
                  {
                     name: 'Suggestions Updates Channel Change',
                     value: `Formerly: ${formerChannel}\n\nNow: ${channel}`,
                     inline: false,
                  },
               ],
            );
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
      {
         name: 'auto_delete',
         info: {
            module: Modules['Suggestions'],
            description: 'Set whether suggestions are deleted upon being approved, denied, or marked as added.',
            usageExample: '/suggestions auto_delete (true|false)',
            permission: 'suggestions.auto_delete',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const deleteBool = interaction.options.getBoolean('delete');
            const server = interaction.data.guildData;
            if (deleteBool == null)
               return await interaction.reply({
                  embeds: [auxdibot.embeds.error.toJSON()],
               });
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Suggestions Auto Delete Changed';
            const deleteSuggestions = server.suggestions_auto_delete;
            if (deleteBool == deleteSuggestions) {
               embed.description = `Nothing changed. Auto delete is the same as settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { suggestions_auto_delete: deleteBool },
            });
            embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${
               deleteSuggestions ? 'Delete' : 'Do not Delete'
            }\r\n\r\nNow: ${deleteBool ? 'Delete' : 'Do not Delete'}`;
            await handleLog(auxdibot, interaction.data.guild, {
               type: LogAction.SUGGESTIONS_AUTO_DELETE_CHANGED,
               userID: interaction.data.member.id,
               date_unix: Date.now(),
               description: `The suggestions auto deletion for this server has been changed. (Now: ${
                  deleteBool ? 'Delete' : 'Do not Delete'
               })`,
            });
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
      {
         name: 'discussion_threads',
         info: {
            module: Modules['Suggestions'],
            description: 'Set whether a discussion thread is created when a suggestion is created.',
            usageExample: '/suggestions discussion_threads (true|false)',
            permission: 'suggestions.discussion_threads',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const create_thread = interaction.options.getBoolean('create_thread');
            const server = interaction.data.guildData;
            if (create_thread == null)
               return await interaction.reply({
                  embeds: [auxdibot.embeds.error.toJSON()],
               });
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Suggestions Discussion Threads Changed';
            const discussionThreads = server.suggestions_discussion_threads;
            if (create_thread == discussionThreads) {
               embed.description = `Nothing changed. Auto delete is the same as settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            server.suggestions_discussion_threads = create_thread;
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { suggestions_discussion_threads: create_thread },
            });
            embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${
               discussionThreads ? 'Create Thread.' : 'Do not create a Thread.'
            }\r\n\r\nNow: ${create_thread ? 'Create Thread.' : 'Do not create a Thread.'}`;
            await handleLog(auxdibot, interaction.data.guild, {
               type: LogAction.SUGGESTIONS_THREAD_CREATION_CHANGED,
               userID: interaction.data.member.id,
               date_unix: Date.now(),
               description: `The suggestions auto deletion for this server has been changed. (Now: ${
                  create_thread ? 'Create Thread.' : 'Do not create a Thread.'
               })`,
            });
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
      {
         name: 'reactions',
         info: {
            module: Modules['Suggestions'],
            description: 'List the reactions for suggestions.',
            usageExample: '/suggestions reactions',
            permission: 'suggestions.reactions',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const infoEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            const server = interaction.data.guildData;
            infoEmbed.title = '❓ Suggestions Reactions';
            infoEmbed.description = server.suggestions_reactions.reduce(
               (accumulator: string, value: string, index: number) => `${accumulator}\n**${index + 1})** ${value}`,
               '',
            );
            return await interaction.reply({ embeds: [infoEmbed] });
         },
      },
      {
         name: 'add_reaction',
         info: {
            module: Modules['Suggestions'],
            description:
               'Add a reaction to the reactions on suggestions, with a specified value for the rating given. Positive numbers are upvotes, negative numbers are downvotes.',
            usageExample: '/suggestions add_reaction (reaction) (rating)',
            permission: 'suggestions.reactions.add',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const reaction = interaction.options.getString('reaction');
            if (!reaction) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'You need to specify a valid reaction!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (server.suggestions_reactions.find((suggestionReaction) => suggestionReaction == reaction)) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'This suggestion reaction already exists!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const regex = emojiRegex();
            const emojis = reaction.match(regex);
            const emoji =
               interaction.client.emojis.cache.find((i) => i.toString() == reaction) ||
               (emojis != null ? emojis[0] : null);
            if (!emoji) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "This isn't a valid reaction!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            server.suggestions_reactions.push(reaction);
            await auxdibot.database.servers.update({
               where: { serverID: interaction.data.guild.id },
               data: { suggestions_reactions: server.suggestions_reactions },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Added ${reaction} as a suggestion reaction.`;
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'remove_reaction',
         info: {
            module: Modules['Suggestions'],
            description: 'Remove a reaction from the reactions on suggestions.',
            usageExample: '/suggestions remove_reaction (reaction|index)',
            permission: 'suggestions.reactions.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const reaction = interaction.options.getString('reaction'),
               index = interaction.options.getNumber('index');
            if (!index && !reaction) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'You need to specify a valid reaction or index!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const suggestionReaction = server.suggestions_reactions.find(
               (i) => (index ? server.suggestions_reactions.indexOf(i) == index - 1 : false) || i == reaction,
            );
            if (!suggestionReaction) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "Couldn't find that suggestion reaction!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const suggestionsIndex = server.suggestions_reactions.indexOf(suggestionReaction);
            if (suggestionsIndex != -1) {
               server.suggestions_reactions.splice(suggestionsIndex, 1);
               await auxdibot.database.servers.update({
                  where: { serverID: interaction.data.guild.id },
                  data: { suggestions_reactions: server.suggestions_reactions },
               });
            }
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Removed ${suggestionReaction} from the reactions.`;
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'approve',
         info: {
            module: Modules['Suggestions'],
            description: 'Mark a suggestion as approved.',
            usageExample: '/suggestions approve (id)',
            permission: 'suggestions.state.approve',
         },
         execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
            stateCommand(auxdibot, interaction, SuggestionState.APPROVED),
      },
      {
         name: 'deny',
         info: {
            module: Modules['Suggestions'],
            description: 'Mark a suggestion as denied.',
            usageExample: '/suggestions deny (id)',
            permission: 'suggestions.state.deny',
         },
         execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
            stateCommand(auxdibot, interaction, SuggestionState.DENIED),
      },
      {
         name: 'consider',
         info: {
            module: Modules['Suggestions'],
            description: 'Mark a suggestion as considered.',
            usageExample: '/suggestions consider (id)',
            permission: 'suggestions.state.consider',
         },
         execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
            stateCommand(auxdibot, interaction, SuggestionState.CONSIDERED),
      },
      {
         name: 'add',
         info: {
            module: Modules['Suggestions'],
            description: 'Mark a suggestion as added.',
            usageExample: '/suggestions add (id)',
            permission: 'suggestions.state.add',
         },
         execute: (auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) =>
            stateCommand(auxdibot, interaction, SuggestionState.ADDED),
      },
      {
         name: 'ban',
         info: {
            module: Modules['Suggestions'],
            description: 'Ban a user from using suggestions.',
            usageExample: '/suggestions ban (user)',
            permission: 'suggestions.ban',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const user = interaction.options.getUser('user', true);
            const executed = interaction.data.guild.members.cache.get(user.id);
            if (!executed) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "Couldn't find that member on this server!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (!canExecute(interaction.data.guild, interaction.data.member, executed)) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
               return await interaction.reply({ embeds: [noPermissionEmbed] });
            }
            await auxdibot.database.servermembers.upsert({
               where: { serverID_userID: { serverID: interaction.data.guild.id, userID: user.id } },
               update: { suggestions_banned: true },
               create: { serverID: interaction.data.guild.id, userID: user.id },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = 'Success!';
            successEmbed.description = `<@${user.id}> has been banned from suggestions.`;
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'unban',
         info: {
            module: Modules['Suggestions'],
            description: 'Unban a user, allowing them to use suggestions.',
            usageExample: '/suggestions unban (user)',
            permission: 'suggestions.ban.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const user = interaction.options.getUser('user', true);
            const executed = interaction.data.guild.members.cache.get(user.id);
            if (!executed) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "Couldn't find that member on this server!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (!canExecute(interaction.data.guild, interaction.data.member, executed)) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
               return await interaction.reply({ embeds: [noPermissionEmbed] });
            }
            await auxdibot.database.servermembers.upsert({
               where: { serverID_userID: { serverID: interaction.data.guild.id, userID: user.id } },
               update: { suggestions_banned: false },
               create: { serverID: interaction.data.guild.id, userID: user.id },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = 'Success!';
            successEmbed.description = `<@${user.id}> has been unbanned from suggestions.`;
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
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
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "Couldn't find that suggestion!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const message_channel: GuildBasedChannel | undefined = suggestion.channelID
               ? interaction.data.guild.channels.cache.get(suggestion.channelID)
               : undefined;
            const message = suggestion.messageID
               ? message_channel && message_channel.isTextBased()
                  ? message_channel.messages.cache.get(suggestion.messageID)
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
                  description: `${interaction.data.member.user.tag} deleted Suggestion #${suggestion.suggestionID}`,
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
      },
   ],
   async execute() {
      return;
   },
};
module.exports = suggestionsCommand;
