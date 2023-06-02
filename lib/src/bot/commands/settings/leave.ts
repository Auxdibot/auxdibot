import { APIEmbed } from '@prisma/client';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import parsePlaceholders from '@/util/parsePlaceholder';
import { toAPIEmbed } from '@/interfaces/embeds/EmbedParameters';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import createEmbedParameters from '@/util/createEmbedParameters';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import Modules from '@/constants/Modules';
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
            const server = interaction.data.guildData;
            const content = interaction.options.getString('content');
            const parameters = argumentsToEmbedParameters(interaction);
            try {
               const newEmbed = toAPIEmbed(parameters);
               await auxdibot.database.servers.update({
                  where: { serverID: server.serverID },
                  data: { leave_embed: (<unknown>newEmbed) as APIEmbed, leave_text: content || server.leave_text },
               });
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
                              auxdibot,
                              JSON.stringify(newEmbed),
                              interaction.data.guild,
                              interaction.data.member,
                           ),
                        ),
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
            const server = interaction.data.guildData;
            try {
               const jsonEmbed = JSON.parse(json) as APIEmbed;
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               await auxdibot.database.servers.update({
                  where: { serverID: server.serverID },
                  data: { leave_embed: jsonEmbed },
               });
               embed.title = 'Success!';
               embed.description = `Set the leave embed.`;
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: "Here's a preview of the new leave embed!",
                     ...(Object.entries(server.leave_embed || {}).length != 0
                        ? {
                             embeds: [
                                JSON.parse(
                                   await parsePlaceholders(
                                      auxdibot,
                                      JSON.stringify(jsonEmbed),
                                      interaction.data.guild,
                                      interaction.data.member,
                                   ),
                                ),
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
            const settings = interaction.data.guildData;
            try {
               return await interaction.reply({
                  content: `**EMBED PREVIEW**\r\n${settings.leave_text || ''}`,
                  ...(Object.entries(settings.leave_embed || {}).length != 0
                     ? {
                          embeds: [
                             JSON.parse(
                                await parsePlaceholders(
                                   auxdibot,
                                   JSON.stringify(settings.leave_embed),
                                   interaction.data.guild,
                                   interaction.data.member,
                                ),
                             ),
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
