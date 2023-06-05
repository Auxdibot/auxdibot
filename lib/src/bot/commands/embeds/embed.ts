import {
   APIEmbed,
   ChannelType,
   Embed,
   EmbedAuthorOptions,
   EmbedField,
   EmbedFooterOptions,
   GuildMember,
   SlashCommandBuilder,
   EmbedBuilder,
} from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import { toAPIEmbed } from '@/interfaces/embeds/EmbedParameters';
import { getMessage } from '@/util/getMessage';
import parsePlaceholders from '@/util/parsePlaceholder';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import createEmbedParameters from '@/util/createEmbedParameters';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';

dotenv.config();
const embedCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.')
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('create')
               .setDescription('Create an embed with Auxdibot.')
               .addChannelOption((option) =>
                  option
                     .setName('channel')
                     .setDescription('The channel to post the embed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               ),
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
      ),
   info: {
      module: Modules['Embeds'],
      description: 'Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.',
      usageExample: '/embed (create|custom|edit|edit_custom|json)',
      permission: 'embed',
   },
   subcommands: [
      {
         name: 'create',
         info: {
            module: Modules['Embeds'],
            usageExample:
               '/embed create (channel) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            description: 'Create an embed with Auxdibot.',
            permission: 'embed.create',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
            const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
            const parameters = argumentsToEmbedParameters(interaction);
            try {
               await channel.send({
                  content: content,
                  embeds: [
                     toAPIEmbed(
                        JSON.parse(
                           await parsePlaceholders(
                              auxdibot,
                              JSON.stringify(parameters),
                              interaction.data.guild,
                              interaction.data.member,
                           ),
                        ),
                     ) as APIEmbed,
                  ],
               });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR',
                  'There was an error sending that embed!',
                  interaction,
               );
            }

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Sent embed to ${channel}.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'create_json',
         info: {
            module: Modules['Embeds'],
            usageExample: '/embed create_json (channel) (json)',
            description: 'Create an embed with Auxdibot using valid Discord Embed JSON data.',
            permission: 'embed.create.json',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
            const json = interaction.options.getString('json', true);
            try {
               await channel.send({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           auxdibot,
                           json,
                           interaction.data.guild,
                           interaction.member as GuildMember | undefined,
                        ),
                     ),
                  ],
               });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR_JSON',
                  'There was an error sending that embed! (Most likely due to malformed JSON.)',
                  interaction,
               );
            }

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Sent embed to ${channel}.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'edit',
         info: {
            module: Modules['Embeds'],
            usageExample:
               '/embed edit (message_id) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            description: 'Edit an existing Embed by Auxdibot.',
            permission: 'embed.edit',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id', true);
            const guild = interaction.data.guild;
            const message = await getMessage(guild, message_id);
            const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
            const parameters = argumentsToEmbedParameters(interaction);
            if (!message)
               return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
            if (message.embeds.length <= 0)
               return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);

            try {
               const embed = message.embeds[0].toJSON();
               embed.url = parameters.title_url;
               embed.title = parameters.title ? await parsePlaceholders(auxdibot, parameters.title) : embed.title;
               embed.color = parameters.color ? parseInt('0x' + parameters.color.replaceAll('#', ''), 16) : embed.color;
               embed.description = parameters.description
                  ? await parsePlaceholders(auxdibot, parameters.description)
                  : embed.description;
               embed.author = parameters.author_text
                  ? <EmbedAuthorOptions>{
                       name: await parsePlaceholders(auxdibot, parameters.author_text),
                       ...(parameters.author_url ? { url: parameters.author_url } : {}),
                       ...(parameters.author_icon ? { iconURL: parameters.author_icon } : {}),
                    }
                  : embed.author;
               embed.fields = parameters.fields || embed.fields;
               embed.footer = parameters.footer_text
                  ? <EmbedFooterOptions>{
                       text: await parsePlaceholders(auxdibot, parameters.footer_text),
                       ...(parameters.footer_icon ? { iconURL: parameters.footer_icon } : {}),
                    }
                  : embed.footer;
               embed.image = parameters.image_url
                  ? { url: await parsePlaceholders(auxdibot, parameters.image_url) }
                  : embed.image;
               embed.thumbnail = parameters.thumbnail_url
                  ? { url: await parsePlaceholders(auxdibot, parameters.thumbnail_url) }
                  : embed.thumbnail;

               await message.edit({ ...(content ? { content } : {}), embeds: [embed] });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'FAILED_EMBED_EDIT',
                  'There was an error editing that embed! (Auxdibot cannot edit that message, or the embed specified is invalid!)',
                  interaction,
               );
            }
            const success_embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            success_embed.title = 'Success!';
            success_embed.description = `Edited embed in ${message.channel}.`;
            return await interaction.reply({ embeds: [success_embed] });
         },
      },
      {
         name: 'edit_json',
         info: {
            module: Modules['Embeds'],
            usageExample: '/embed edit_json (message_id) (json)',
            description: 'Edit an existing Embed by Auxdibot using valid Discord Embed JSON data.',
            permission: 'embed.edit.json',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id', true);
            const json = interaction.options.getString('json', true);
            const guild = interaction.data.guild;
            const message = await getMessage(guild, message_id);
            if (!message)
               return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
            if (message.embeds.length <= 0)
               return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);
            try {
               await message.edit({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           auxdibot,
                           json,
                           interaction.data.guild,
                           interaction.member as GuildMember | undefined,
                        ),
                     ),
                  ],
               });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'FAILED_EMBED_EDIT_JSON',
                  'There was an error editing that embed! (Auxdibot cannot edit that message, or the JSON provided is malformed!)',
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Edited embed in ${message.channel}.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'json',
         info: {
            module: Modules['Embeds'],
            usageExample: '/embed json (message_id)',
            description: 'Get the Discord Embed JSON data of any Embed on your server.',
            permission: 'embed.json',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id', true);
            const guild = interaction.data.guild;
            const message = await getMessage(guild, message_id);
            if (!message)
               return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
            if (message.embeds.length <= 0)
               return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);

            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            try {
               embed.fields = message.embeds.map(
                  (embed: Embed, index: number) =>
                     <EmbedField>{
                        name: `Embed #${index + 1}`,
                        value: `\`\`\`${JSON.stringify(embed.toJSON())}\`\`\``,
                     },
               );
               embed.title = 'Embed JSON Data';
               return await interaction.reply({ embeds: [embed] });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_JSON_TOO_LARGE',
                  "The embed given exceeds Auxdibot's embed message limit!",
                  interaction,
               );
            }
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = embedCommand;
