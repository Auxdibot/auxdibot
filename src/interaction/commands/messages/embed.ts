import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { postCommand } from '../../subcommands/embeds/postCommand';
import { postJSON } from '../../subcommands/embeds/postJSON';
import { editCommand } from '../../subcommands/embeds/editCommand';
import { editEmbedJSON } from '../../subcommands/embeds/editEmbedJSON';
import { getEmbedJSON } from '../../subcommands/embeds/getEmbedJSON';
import { embedParameters } from '@/interaction/subcommands/embeds/embedParameters';
import { buildEmbed } from '@/interaction/subcommands/embeds/buildEmbed';
import { embedList } from '@/interaction/subcommands/embeds/embedList';
import { embedDelete } from '@/interaction/subcommands/embeds/deleteEmbed';
import { postEmbed } from '@/interaction/subcommands/embeds/postEmbed';
import { editEmbed } from '@/interaction/subcommands/embeds/editEmbed';

dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.')
      .addSubcommand((builder) =>
         builder
            .setName('build')
            .setDescription("Build a Discord Embed using Auxdibot's Embed Builder.")
            .addStringOption((builder) => builder.setName('id').setDescription('The ID to use for the Embed.')),
      )
      .addSubcommand((builder) => builder.setName('list').setDescription('List every stored embed in the server.'))
      .addSubcommand((builder) =>
         builder
            .setName('delete')
            .setDescription('Delete a stored embed from the server.')
            .addStringOption((option) =>
               option.setName('id').setDescription('The ID of the Embed to delete.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('post')
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
               .setName('post_command')
               .setDescription('Post an embed using command parameters.')
               .addChannelOption((option) =>
                  option
                     .setName('channel')
                     .setDescription('The channel to post the embed in.')
                     .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                     .setRequired(true),
               ),
         ).addStringOption((option) =>
            option.setName('webhook_url').setDescription('The Webhook URL to use for sending the Embed. (Optional)'),
         ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('post_json')
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
               option.setName('webhook_url').setDescription('The Webhook URL to use for sending the Embed. (Optional)'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('edit')
            .setDescription('Edit an existing Embed.')
            .addStringOption((option) =>
               option
                  .setName('message_id')
                  .setDescription('The message ID of the Embed. (Copy ID of message with Developer Mode.)')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option.setName('id').setDescription('The ID of the stored Embed to use for editing.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('edit_command')
               .setDescription('Edit an existing Embed using command parameters.')
               .addStringOption((option) =>
                  option
                     .setName('message_id')
                     .setDescription('The message ID of the Embed. (Copy ID of message with Developer Mode.)')
                     .setRequired(true),
               ),
         ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('edit_json')
            .setDescription('Edit an existing Embed using valid Discord Embed JSON data.')
            .addStringOption((option) =>
               option
                  .setName('message_id')
                  .setDescription('The message ID of the Embed. (Copy ID of message with Developer Mode.)')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option
                  .setName('json')
                  .setDescription('The JSON data to use for creating the Discord Embed.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('json')
            .setDescription('Get the Discord Embed JSON data of any Embed on your server.')
            .addStringOption((option) =>
               option
                  .setName('message_id')
                  .setDescription('The message ID of the Embed. (Copy ID of message with Developer Mode.)')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder.setName('parameters').setDescription('View the Embed parameters used to build Discord Embeds.'),
      ),
   info: {
      module: Modules['Messages'],
      description: 'Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.',
      usageExample:
         '/embed (build|list|delete|post|post_command|post_json|edit|edit_command|edit_json|json|parameters)',
      permissionsRequired: [PermissionFlagsBits.ManageMessages],
   },
   subcommands: [
      buildEmbed,
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
   ],
   async execute() {
      return;
   },
};
