import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { purgeAll } from '@/interaction/subcommands/moderation/purge/purgeAll';
import { purgeUser } from '@/interaction/subcommands/moderation/purge/purgeUser';
import { purgeFilter } from '@/interaction/subcommands/moderation/purge/purgeFilter';
import { purgeAttachments } from '@/interaction/subcommands/moderation/purge/purgeAttachments';
import { purgeInvites } from '@/interaction/subcommands/moderation/purge/purgeInvites';
import { purgeEmbeds } from '@/interaction/subcommands/moderation/purge/purgeEmbeds';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('purge')
      .setDescription('Purge messages in a channel.')
      .addSubcommand((subcommand) =>
         subcommand
            .setName('all')
            .setDescription('Purge messages regardless of content or user.')
            .addNumberOption((builder) =>
               builder.setName('amount').setDescription('The total amount of messages to purge.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('user')
            .setDescription('Purge messages in a channel by user.')
            .addNumberOption((builder) =>
               builder.setName('amount').setDescription('The amount of messages to search.').setRequired(true),
            )
            .addUserOption((builder) =>
               builder.setName('user').setDescription('The user whose messages are to be deleted.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('filter')
            .setDescription('Purge messages in a channel by a filter (Supports RegEx!)')
            .addNumberOption((builder) =>
               builder.setName('amount').setDescription('The amount of messages to search.').setRequired(true),
            )
            .addStringOption((builder) =>
               builder
                  .setName('filter')
                  .setDescription('The filter to use to delete messages (Supports RegEx!)')
                  .setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('attachments')
            .setDescription('Purge messages based on whether they have attachments.')
            .addNumberOption((builder) =>
               builder.setName('amount').setDescription('The amount of messages to search.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('invites')
            .setDescription('Purge messages based on whether they have invites.')
            .addNumberOption((builder) =>
               builder.setName('amount').setDescription('The amount of messages to search.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('embeds')
            .setDescription('Purge messages based on whether they have embeds.')
            .addNumberOption((builder) =>
               builder.setName('amount').setDescription('The amount of messages to search.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Purge messages in a channel.',
      usageExample: '/purge (user|filter|all|invites|attachments)',
   },
   subcommands: [purgeAll, purgeUser, purgeFilter, purgeAttachments, purgeInvites, purgeEmbeds],
   async execute() {
      return;
   },
};
