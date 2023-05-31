import { EmbedBuilder, APIEmbed, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';

import parsePlaceholders from '@/util/parsePlaceholder';
import { toAPIEmbed } from '@/interfaces/embeds/EmbedParameters';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import createEmbedParameters from '@/util/createEmbedParameters';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';

const leaveCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Change settings for leave messages on the server.')
      .addSubcommand((builder) =>
         createEmbedParameters(builder.setName('message').setDescription('Display an embed (With placeholders)!')),
      )
      .addSubcommand((builder) =>
         builder
            .setName('embed_json')
            .setDescription('Display some JSON as an embed (With placeholders)!')
            .addStringOption((option) =>
               option
                  .setName('json')
                  .setDescription('The JSON data to use for creating the Discord Embed.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the leave embed.')),
   info: {
      module: Modules['Settings'],
      description:
         'Change settings for leave messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
      usageExample: '/leave (message|embed_json|preview)',
      permission: 'settings.leave',
   },
   subcommands: [
      {
         name: 'message',
         info: {
            module: Modules['Settings'],
            description:
               'Set the leave message. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
            usageExample:
               '/leave message [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with "|d|", and seperate fields with "|s|")] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'settings.leave.message',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const settings = await interaction.data.guildData.fetchSettings();
            const content = interaction.options.getString('content');
            const parameters = argumentsToEmbedParameters(interaction);
            try {
               settings.leave_embed = toAPIEmbed(parameters);
               if (content) {
                  settings.leave_text = content;
               }
               await settings.save({ validateModifiedOnly: true });
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               embed.title = 'Success!';
               embed.description = `Set the leave embed.`;
               await interaction.reply({ embeds: [embed] });
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: "Here's a preview of the new leave embed!",
                     embeds: [
                        JSON.parse(
                           await parsePlaceholders(
                              JSON.stringify(settings.leave_embed),
                              interaction.data.guild,
                              interaction.data.member,
                           ),
                        ) as APIEmbed,
                     ],
                  });
            } catch (x) {
               const embed = auxdibot.embeds.error.toJSON();
               embed.description = "Couldn't make that embed!";
               return await interaction.reply({ embeds: [embed] });
            }

            return;
         },
      },
      {
         name: 'embed_json',
         info: {
            module: Modules['Settings'],
            description:
               'Add an embed to the join message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
            usageExample: '/leave embed_json (json)',
            permission: 'settings.leave.embed_json',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const json = interaction.options.getString('json', true);
            const settings = await interaction.data.guildData.fetchSettings();
            try {
               const jsonEmbed = JSON.parse(json) as APIEmbed;
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               settings.leave_embed = jsonEmbed;
               await settings.save({ validateModifiedOnly: true });
               embed.title = 'Success!';
               embed.description = `Set the leave embed.`;
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: "Here's a preview of the new leave embed!",
                     ...(Object.entries(settings.leave_embed || {}).length != 0
                        ? {
                             embeds: [
                                JSON.parse(
                                   await parsePlaceholders(
                                      JSON.stringify(settings.leave_embed),
                                      interaction.data.guild,
                                      interaction.data.member,
                                   ),
                                ) as APIEmbed,
                             ],
                          }
                        : {}),
                  });
               return await interaction.reply({ embeds: [embed] });
            } catch (x) {
               const embed = auxdibot.embeds.error.toJSON();
               embed.description = "This isn't valid Embed JSON!";
               return await interaction.reply({ embeds: [embed] });
            }
         },
      },
      {
         name: 'preview',
         info: {
            module: Modules['Settings'],
            description: 'Preview the leave message.',
            usageExample: '/leave preview',
            permission: 'settings.leave.preview',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const settings = await interaction.data.guildData.fetchSettings();
            try {
               return await interaction.reply({
                  content: `**EMBED PREVIEW**\r\n${settings.leave_text || ''}`,
                  ...(Object.entries(settings.leave_embed || {}).length != 0
                     ? {
                          embeds: [
                             JSON.parse(
                                await parsePlaceholders(
                                   JSON.stringify(settings.leave_embed),
                                   interaction.data.guild,
                                   interaction.data.member,
                                ),
                             ) as APIEmbed,
                          ],
                       }
                     : {}),
               });
            } catch (x) {
               const error = auxdibot.embeds.error.toJSON();
               error.description = "This isn't valid! Try changing the Leave Embed or Leave Text.";
               return interaction.channel && interaction.channel.isTextBased()
                  ? await interaction.channel.send({ embeds: [error] })
                  : undefined;
            }
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = leaveCommand;
