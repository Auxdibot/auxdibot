import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { createEmbed } from '../../subcommands/embeds/createEmbed';
import { createEmbedJSON } from '../../subcommands/embeds/createEmbedJSON';
import { editEmbed } from '../../subcommands/embeds/editEmbed';
import { editEmbedJSON } from '../../subcommands/embeds/editEmbedJSON';
import { getEmbedJSON } from '../../subcommands/embeds/getEmbedJSON';
import { embedParameters } from '@/interaction/subcommands/embeds/embedParameters';
import { buildEmbed } from '@/interaction/subcommands/embeds/buildEmbed';

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

      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('create')
               .setDescription('Create an embed with Auxdibot.')
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
            .setName('create_json')
            .setDescription('Create an embed with Auxdibot using valid Discord Embed JSON data.')
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
         createEmbedParameters(
            builder
               .setName('edit')
               .setDescription('Edit an existing Embed by Auxdibot.')
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
            .setDescription('Edit an existing Embed by Auxdibot using valid Discord Embed JSON data.')
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
      usageExample: '/embed (build|create|edit|edit_json|json|parameters)',
      permissionsRequired: [PermissionFlagsBits.ManageMessages],
   },
   subcommands: [buildEmbed, createEmbed, createEmbedJSON, editEmbed, editEmbedJSON, getEmbedJSON, embedParameters],
   async execute() {
      return;
   },
};
