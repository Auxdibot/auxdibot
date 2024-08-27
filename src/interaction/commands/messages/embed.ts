import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { postCommand } from '../../subcommands/embeds/post/postCommand';
import { postJSON } from '../../subcommands/embeds/post/postJSON';
import { editCommand } from '../../subcommands/embeds/edit/editCommand';
import { editEmbedJSON } from '../../subcommands/embeds/edit/editEmbedJSON';
import { getEmbedJSON } from '../../subcommands/embeds/getEmbedJSON';
import { embedParameters } from '@/interaction/subcommands/embeds/embedParameters';
import { embedBuilder } from '@/interaction/subcommands/embeds/embedBuilder';
import { embedList } from '@/interaction/subcommands/embeds/storage/embedList';
import { embedDelete } from '@/interaction/subcommands/embeds/storage/deleteEmbed';
import { postEmbed } from '@/interaction/subcommands/embeds/post/postEmbed';
import { editEmbed } from '@/interaction/subcommands/embeds/edit/editEmbed';
import { storeEmbedWithCommand } from '@/interaction/subcommands/embeds/storage/storeEmbedWithCommand';
import { storeEmbedWithJSON } from '@/interaction/subcommands/embeds/storage/storeEmbedWithJSON';

dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.')
      .addSubcommand((builder) =>
         builder
            .setName('builder')
            .setDescription("Create a Discord Embed using Auxdibot's Embed Builder.")
            .addStringOption((builder) => builder.setName('id').setDescription('The ID to use for the Embed.')),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('storage')
            .setDescription('Store, list, or delete stored Embeds.')
            .addSubcommand((builder) =>
               createEmbedParameters(
                  builder
                     .setName('command')
                     .setDescription('Create an Embed using command parameters.')
                     .addStringOption((option) =>
                        option.setName('id').setDescription('The ID to use for the Embed.').setRequired(true),
                     ),
               ).addStringOption((option) =>
                  option
                     .setName('webhook_url')
                     .setDescription('The Webhook URL to use for sending the Embed. (Optional)'),
               ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('json')
                  .setDescription('Store an Embed using command parameters.')
                  .addStringOption((option) =>
                     option.setName('id').setDescription('The ID to use for the Embed.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('json')
                        .setDescription('The JSON data to use for creating the Discord Embed.')
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option.setName('content').setDescription('The message content to send with the embed. (Optional)'),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('webhook_url')
                        .setDescription('The Webhook URL to use for sending the Embed. (Optional)'),
                  ),
            )
            .addSubcommand((builder) =>
               builder.setName('list').setDescription('List every stored embed in the server.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('delete')
                  .setDescription('Delete a stored embed from the server.')
                  .addStringOption((option) =>
                     option.setName('id').setDescription('The ID of the Embed to delete.').setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('post')
            .setDescription('Post an embed to a channel.')
            .addSubcommand((builder) =>
               builder
                  .setName('embed')
                  .setDescription('Post a stored embed using its ID.')
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to post the embed in.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option.setName('id').setDescription('The ID of the Embed to post.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               createEmbedParameters(
                  builder
                     .setName('command')
                     .setDescription('Post an embed using command parameters.')
                     .addChannelOption((option) =>
                        option
                           .setName('channel')
                           .setDescription('The channel to post the embed in.')
                           .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                           .setRequired(true),
                     ),
               ).addStringOption((option) =>
                  option
                     .setName('webhook_url')
                     .setDescription('The Webhook URL to use for sending the Embed. (Optional)'),
               ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('json')
                  .setDescription('Post an embed using valid Discord Embed JSON data.')
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to post the embed in.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('json')
                        .setDescription('The JSON data to use for creating the Discord Embed.')
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('webhook_url')
                        .setDescription('The Webhook URL to use for sending the Embed. (Optional)'),
                  ),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('edit')
            .setDescription('Edit an existing message sent by Auxdibot.')
            .addSubcommand((builder) =>
               builder
                  .setName('embed')
                  .setDescription('Add a stored embed to a message using its ID.')
                  .addStringOption((option) =>
                     option
                        .setName('message_id')
                        .setDescription('The message ID of the message. (Copy ID of message with Developer Mode.)')
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('id')
                        .setDescription('The ID of the stored Embed to use for the message')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               createEmbedParameters(
                  builder
                     .setName('command')
                     .setDescription('Edit an existing Embed using command parameters.')
                     .addStringOption((option) =>
                        option
                           .setName('message_id')
                           .setDescription('The message ID of the message. (Copy ID of message with Developer Mode.)')
                           .setRequired(true),
                     ),
               ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('json')
                  .setDescription('Edit an existing Embed using valid Discord Embed JSON data.')
                  .addStringOption((option) =>
                     option
                        .setName('message_id')
                        .setDescription('The message ID of the message. (Copy ID of message with Developer Mode.)')
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('json')
                        .setDescription('The JSON data to use for creating the Discord Embed.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('json')
            .setDescription('Get the Discord Embed JSON data of any Embed on your server.')
            .addStringOption((option) =>
               option
                  .setName('message_id')
                  .setDescription('The message ID of the message. (Copy ID of message with Developer Mode.)')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder.setName('parameters').setDescription('View the Embed parameters used to build Discord Embeds.'),
      ),
   info: {
      module: Modules['Messages'],
      description: 'Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.',
      usageExample: '/embed (builder|storage|post|edit|json|parameters)',
      permissionsRequired: [PermissionFlagsBits.ManageMessages],
   },
   subcommands: [
      postCommand,
      postJSON,
      editCommand,
      editEmbedJSON,
      getEmbedJSON,
      embedParameters,
      embedList,
      embedDelete,
      postEmbed,
      editEmbed,
      embedBuilder,
      storeEmbedWithCommand,
      storeEmbedWithJSON,
   ],
   async execute() {
      return;
   },
};
