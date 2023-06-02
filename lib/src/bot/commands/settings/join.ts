import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';

import { toAPIEmbed } from '@/interfaces/embeds/EmbedParameters';
import parsePlaceholders from '@/util/parsePlaceholder';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import createEmbedParameters from '@/util/createEmbedParameters';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed } from '@prisma/client';

const joinCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('join')
      .setDescription('Change settings for join messages on the server.')
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
      .addSubcommand((builder) =>
         builder
            .setName('text')
            .setDescription('Show text (With placeholders!)')
            .addStringOption((option) =>
               option.setName('text').setDescription('The text to use when a member joins the server'),
            ),
      )
      .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the join embed.')),
   info: {
      module: Modules['Settings'],
      description:
         'Change settings for join messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
      usageExample: '/join (message|embed_json|preview)',
      permission: 'settings.join',
   },
   subcommands: [
      {
         name: 'message',
         info: {
            module: Modules['Settings'],
            description:
               'Set the join message. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
            usageExample:
               '/join message [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with "|d|", and seperate fields with "|s|")] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'settings.join.message',
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
                  data: { join_embed: (<unknown>newEmbed) as APIEmbed, join_text: content || server.join_text },
               });
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               embed.title = 'Success!';
               embed.description = `Set the join embed.`;
               await interaction.reply({ embeds: [embed] });
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: `Here's a preview of the new join embed!\n${server.join_dm_text || ''}`,
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
               return interaction.channel && interaction.channel.isTextBased()
                  ? await interaction.channel.send({ embeds: [embed] })
                  : undefined;
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
            usageExample: '/join embed_json (json)',
            permission: 'settings.join.embed_json',
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
                  data: { join_embed: jsonEmbed },
               });
               embed.title = 'Success!';
               embed.description = `Set the join embed.`;
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: "Here's a preview of the new join embed!",
                     ...(Object.entries(server.join_embed || {}).length != 0
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
            description: 'Preview the join message.',
            usageExample: '/join preview',
            permission: 'settings.join.preview',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            try {
               return await interaction.reply({
                  content: `**EMBED PREVIEW**\r\n${server.join_text || ''}`,
                  ...(Object.entries(server.join_embed || {}).length != 0
                     ? {
                          embeds: [
                             JSON.parse(
                                await parsePlaceholders(
                                   auxdibot,
                                   JSON.stringify(server.join_embed),
                                   interaction.data.guild,
                                   interaction.data.member,
                                ),
                             ),
                          ],
                       }
                     : {}),
               });
            } catch (x) {
               console.log(x);
               const error = auxdibot.embeds.error.toJSON();
               error.description = "This isn't valid! Try changing the Join Embed or Join Text.";
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
module.exports = joinCommand;
