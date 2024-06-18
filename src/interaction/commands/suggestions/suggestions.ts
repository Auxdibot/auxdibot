import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { suggestionsCreate } from '../../subcommands/suggestions/suggestionsCreate';
import { suggestionsChannel } from '../../subcommands/suggestions/suggestionsChannel';
import { suggestionsUpdateChannel } from '../../subcommands/suggestions/suggestionsUpdateChannel';
import { suggestionsReactions } from '../../subcommands/suggestions/suggestionsReactions';
import { suggestionsAddReactions } from '../../subcommands/suggestions/suggestionsAddReactions';
import { suggestionsRemoveReactions } from '../../subcommands/suggestions/suggestionsRemoveReactions';
import { suggestionsAutoDelete } from '../../subcommands/suggestions/suggestionsAutoDelete';
import { suggestionsDiscussionThreads } from '../../subcommands/suggestions/suggestionsDiscussionThreads';
import { suggestionsBan } from '../../subcommands/suggestions/suggestionsBan';
import { suggestionsUnban } from '../../subcommands/suggestions/suggestionsUnban';
import { suggestionsDelete } from '../../subcommands/suggestions/suggestionsDelete';
import { suggestionsRespond } from '../../subcommands/suggestions/suggestionsRespond';
import { SuggestionState } from '@prisma/client';

export default <AuxdibotCommand>{
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
            .setName('respond')
            .setDescription('Respond to a suggestion submitted by a user.')
            .addNumberOption((builder) =>
               builder.setName('id').setDescription('The ID of the suggestion to respond to.').setRequired(true),
            )
            .addStringOption((builder) =>
               builder
                  .setName('response')
                  .setDescription('The response type for this suggestion.')
                  .addChoices(
                     {
                        name: '➕ Added',
                        value: SuggestionState.ADDED,
                     },
                     {
                        name: '✅ Approved',
                        value: SuggestionState.APPROVED,
                     },
                     {
                        name: '💭 Considered',
                        value: SuggestionState.CONSIDERED,
                     },
                     {
                        name: '❌ Denied',
                        value: SuggestionState.DENIED,
                     },
                  )
                  .setRequired(true),
            )
            .addStringOption((builder) =>
               builder.setName('reason').setDescription('The reason for this response. (Optional)'),
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
         '/suggestions (create|channel|updates_channel|auto_delete|discussion_threads|reactions|remove_reaction|add_reaction|respond|ban|unban|delete)',
      permissionsRequired: [PermissionFlagsBits.Administrator],
   },
   subcommands: [
      suggestionsCreate,
      suggestionsChannel,
      suggestionsUpdateChannel,
      suggestionsReactions,
      suggestionsAddReactions,
      suggestionsRemoveReactions,
      suggestionsAutoDelete,
      suggestionsDiscussionThreads,
      suggestionsBan,
      suggestionsUnban,
      suggestionsDelete,
      suggestionsRespond,
   ],
   async execute() {
      return;
   },
};
