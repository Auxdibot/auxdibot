import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { toAPIEmbed } from '@/interfaces/embeds/EmbedParameters';
import parsePlaceholders from '@/util/parsePlaceholder';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import createEmbedParameters from '@/util/createEmbedParameters';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed } from '@prisma/client';
import handleError from '@/util/handleError';

const joinDMCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('join_dm')
      .setDescription('Change settings for join DM messages on the server.')
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
      .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the join embed.')),
   info: {
      module: Modules['Settings'],
      description:
         'Change settings for join DM messages on the server. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
      usageExample: '/join_dm (message|embed_json|preview)',
      permission: 'settings.joindm',
   },
   subcommands: [
      {
         name: 'message',
         info: {
            module: Modules['Settings'],
            description:
               'Set the join DM message. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
            usageExample:
               '/join_dm message [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'settings.joindm.message',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const content = interaction.options.getString('content');
            const parameters = argumentsToEmbedParameters(interaction);
            try {
               const newEmbed = toAPIEmbed(parameters);
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: `Here's a preview of the new join DM embed!\n${server.join_dm_text || ''}`,
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
               await auxdibot.database.servers.update({
                  where: { serverID: server.serverID },
                  data: {
                     join_dm_embed: (<unknown>newEmbed) as APIEmbed,
                     join_dm_text: content || server.join_dm_text,
                  },
               });
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               embed.title = 'Success!';
               embed.description = `Set the join DM embed.`;
               await interaction.reply({ embeds: [embed] });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR',
                  'There was an error sending that embed!',
                  interaction,
               );
            }
         },
      },
      {
         name: 'embed_json',
         info: {
            module: Modules['Settings'],
            description:
               'Add an embed to the join DM message using custom JSON. (Placeholders are supported. Do /placeholders for a list of placeholders.)',
            usageExample: '/join_dm embed_json (json)',
            permission: 'settings.joindm.embed_json',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const json = interaction.options.getString('json', true);
            const server = interaction.data.guildData;
            try {
               const jsonEmbed = JSON.parse(json) as APIEmbed;
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: "Here's a preview of the new join DM embed!",
                     ...(Object.entries(json || {}).length != 0
                        ? {
                             embeds: [
                                JSON.parse(
                                   await parsePlaceholders(
                                      auxdibot,
                                      json,
                                      interaction.data.guild,
                                      interaction.data.member,
                                   ),
                                ),
                             ],
                          }
                        : {}),
                  });
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               await auxdibot.database.servers.update({
                  where: { serverID: server.serverID },
                  data: { leave_embed: jsonEmbed },
               });
               embed.title = 'Success!';
               embed.description = `Set the join DM embed.`;
               return await interaction.reply({ embeds: [embed] });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR_JSON',
                  'There was an error sending that embed! (Most likely due to malformed JSON.)',
                  interaction,
               );
            }
         },
      },
      {
         name: 'preview',
         info: {
            module: Modules['Settings'],
            description: 'Preview the join DM message.',
            usageExample: '/join_dm preview',
            permission: 'settings.joindm.preview',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const settings = interaction.data.guildData;
            try {
               return await interaction.reply({
                  content: `**EMBED PREVIEW**\r\n${settings.join_dm_text || ''}`,
                  ...(Object.entries(settings.join_dm_embed || {}).length != 0
                     ? {
                          embeds: [
                             JSON.parse(
                                await parsePlaceholders(
                                   auxdibot,
                                   JSON.stringify(settings.join_dm_embed),
                                   interaction.data.guild,
                                   interaction.data.member,
                                ),
                             ),
                          ],
                       }
                     : {}),
               });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'INVALID_JOIN_DM_EMBED',
                  'This is an invalid embed! This will not be able to send when a user joins the server. Change either the Embed or Text to fix this error.',
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
module.exports = joinDMCommand;
