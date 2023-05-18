import {
   APIEmbed,
   ChannelType,
   Embed,
   EmbedAuthorOptions,
   EmbedField,
   EmbedFooterOptions,
   GuildMember,
   SlashCommandBuilder,
} from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import dotenv from 'dotenv';
import { toAPIEmbed } from '@util/types/EmbedParameters';
import { getMessage } from '@util/functions/getMessage';
import parsePlaceholders from '@util/functions/parsePlaceholder';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import createEmbedParameters from '@util/functions/createEmbedParameters';
import argumentsToEmbedParameters from '@util/functions/argumentsToEmbedParameters';
import Modules from '@util/constants/Modules';

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
      module: Modules['embeds'],
      description: 'Create or edit a Discord Embed with Auxdibot, as well as obtain the JSON data of any Embed.',
      usageExample: '/embed (create|custom|edit|edit_custom|json)',
      permission: 'embed',
   },
   subcommands: [
      {
         name: 'create',
         info: {
            module: Modules['embeds'],
            usageExample:
               '/embed create (channel) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            description: 'Create an embed with Auxdibot.',
            permission: 'embed.create',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
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
                              JSON.stringify(parameters),
                              interaction.data.guild,
                              interaction.data.member,
                           ),
                        ),
                     ) as APIEmbed,
                  ],
               });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error sending that embed!`;
               return await interaction.reply({ embeds: [embed] });
            }

            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = 'Success!';
            embed.description = `Sent embed to ${channel}.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'create_json',
         info: {
            module: Modules['embeds'],
            usageExample: '/embed create_json (channel) (json)',
            description: 'Create an embed with Auxdibot using valid Discord Embed JSON data.',
            permission: 'embed.create.json',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
            const json = interaction.options.getString('json');
            if (!json) return await interaction.reply({ embeds: [Embeds.ERROR_EMBED.toJSON()] });
            try {
               await channel.send({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           json,
                           interaction.data.guild,
                           interaction.member as GuildMember | undefined,
                        ),
                     ) as APIEmbed,
                  ],
               });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error sending that embed! (Most likely due to malformed JSON.)`;
               return await interaction.reply({ embeds: [embed] });
            }

            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = 'Success!';
            embed.description = `Sent embed to ${channel}.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'edit',
         info: {
            module: Modules['embeds'],
            usageExample:
               '/embed edit (message_id) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            description: 'Edit an existing Embed by Auxdibot.',
            permission: 'embed.edit',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id', true);
            const guild = interaction.data.guild;
            const message = await getMessage(guild, message_id);
            const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
            const parameters = argumentsToEmbedParameters(interaction);
            if (!message) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = "Couldn't find that message!";
               return await interaction.reply({ embeds: [error] });
            }
            if (message.embeds.length <= 0) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = 'No embeds exist on this message!';
               return await interaction.reply({ embeds: [error] });
            }

            try {
               const embed = message.embeds[0].toJSON();
               embed.url = parameters.title_url;
               embed.title = parameters.title ? await parsePlaceholders(parameters.title) : embed.title;
               embed.color = parameters.color ? parseInt('0x' + parameters.color.replaceAll('#', ''), 16) : embed.color;
               embed.description = parameters.description
                  ? await parsePlaceholders(parameters.description)
                  : embed.description;
               embed.author = parameters.author_text
                  ? <EmbedAuthorOptions>{
                       name: await parsePlaceholders(parameters.author_text),
                       ...(parameters.author_url ? { url: parameters.author_url } : {}),
                       ...(parameters.author_icon ? { iconURL: parameters.author_icon } : {}),
                    }
                  : embed.author;
               embed.fields = parameters.fields || embed.fields;
               embed.footer = parameters.footer_text
                  ? <EmbedFooterOptions>{
                       text: await parsePlaceholders(parameters.footer_text),
                       ...(parameters.footer_icon ? { iconURL: parameters.footer_icon } : {}),
                    }
                  : embed.footer;
               embed.image = parameters.image_url
                  ? { url: await parsePlaceholders(parameters.image_url) }
                  : embed.image;
               embed.thumbnail = parameters.thumbnail_url
                  ? { url: await parsePlaceholders(parameters.thumbnail_url) }
                  : embed.thumbnail;

               await message.edit({ ...(content ? { content } : {}), embeds: [embed] });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error sending that embed! (Auxdibot cannot edit this!)`;
               return await interaction.reply({ embeds: [embed] });
            }
            const success_embed = Embeds.SUCCESS_EMBED.toJSON();
            success_embed.title = 'Success!';
            success_embed.description = `Edited embed in ${message.channel}.`;
            return await interaction.reply({ embeds: [success_embed] });
         },
      },
      {
         name: 'edit_json',
         info: {
            module: Modules['embeds'],
            usageExample: '/embed edit_json (message_id) (json)',
            description: 'Edit an existing Embed by Auxdibot using valid Discord Embed JSON data.',
            permission: 'embed.edit.json',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id', true);
            const json = interaction.options.getString('json', true);
            const guild = interaction.data.guild;
            const message = await getMessage(guild, message_id);
            if (!message) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = "Couldn't find that message!";
               return await interaction.reply({ embeds: [error] });
            }
            if (message.embeds.length <= 0) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = 'No embeds exist on this message!';
               return await interaction.reply({ embeds: [error] });
            }
            try {
               await message.edit({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           json,
                           interaction.data.guild,
                           interaction.member as GuildMember | undefined,
                        ),
                     ) as APIEmbed,
                  ],
               });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error sending that embed! (Most likely due to malformed JSON, or this message wasn't made by Auxdibot!)`;
               return await interaction.reply({ embeds: [embed] });
            }
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = 'Success!';
            embed.description = `Edited embed in ${message.channel}.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'json',
         info: {
            module: Modules['embeds'],
            usageExample: '/embed json (message_id)',
            description: 'Get the Discord Embed JSON data of any Embed on your server.',
            permission: 'embed.json',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id', true);
            const guild = interaction.data.guild;
            const message = await getMessage(guild, message_id);
            if (!message) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = "Couldn't find that message!";
               return await interaction.reply({ embeds: [error] });
            }
            if (message.embeds.length <= 0) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = 'No embeds exist on this message!';
               return await interaction.reply({ embeds: [error] });
            }
            const embed = Embeds.SUCCESS_EMBED.toJSON();
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
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = 'Embed is too big!';
               return await interaction.reply({ embeds: [error] });
            }
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = embedCommand;
