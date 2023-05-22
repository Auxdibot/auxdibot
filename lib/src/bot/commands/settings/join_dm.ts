import { SlashCommandBuilder, APIEmbed } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import { toAPIEmbed } from '@util/types/EmbedParameters';
import parsePlaceholders from '@util/functions/parsePlaceholder';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import createEmbedParameters from '@util/functions/createEmbedParameters';
import argumentsToEmbedParameters from '@util/functions/argumentsToEmbedParameters';
import Modules from '@util/constants/Modules';

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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const settings = await interaction.data.guildData.fetchSettings();
            const content = interaction.options.getString('content');
            const parameters = argumentsToEmbedParameters(interaction);
            try {
               settings.join_dm_embed = toAPIEmbed(parameters);
               if (content) {
                  settings.join_dm_text = content;
               }
               await settings.save({ validateModifiedOnly: true });
               const embed = Embeds.SUCCESS_EMBED.toJSON();
               embed.title = 'Success!';
               embed.description = `Set the join DM embed.`;
               await interaction.reply({ embeds: [embed] });
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: `Here's a preview of the new join DM embed!\n${settings.join_dm_text || ''}`,
                     embeds: [
                        JSON.parse(
                           await parsePlaceholders(
                              JSON.stringify(settings.join_dm_embed),
                              interaction.data.guild,
                              interaction.data.member,
                           ),
                        ) as APIEmbed,
                     ],
                  });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = "Couldn't make that embed!";
               return await interaction.reply({ embeds: [embed] });
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const json = interaction.options.getString('json', true);
            const settings = await interaction.data.guildData.fetchSettings();
            try {
               const jsonEmbed = JSON.parse(json) as APIEmbed;
               const embed = Embeds.SUCCESS_EMBED.toJSON();
               settings.join_dm_embed = jsonEmbed;
               await settings.save({ validateModifiedOnly: true });
               embed.title = 'Success!';
               embed.description = `Set the join DM embed.`;
               if (interaction.channel && interaction.channel.isTextBased())
                  await interaction.channel.send({
                     content: "Here's a preview of the new join DM embed!",
                     ...(Object.entries(settings.join_dm_embed || {}).length != 0
                        ? {
                             embeds: [
                                JSON.parse(
                                   await parsePlaceholders(
                                      JSON.stringify(settings.join_dm_embed),
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
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = "This isn't valid Embed JSON!";
               return await interaction.reply({ embeds: [embed] });
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const settings = await interaction.data.guildData.fetchSettings();
            try {
               return await interaction.reply({
                  content: `**EMBED PREVIEW**\r\n${settings.join_dm_text || ''}`,
                  ...(Object.entries(settings.join_dm_embed || {}).length != 0
                     ? {
                          embeds: [
                             JSON.parse(
                                await parsePlaceholders(
                                   JSON.stringify(settings.join_dm_embed),
                                   interaction.data.guild,
                                   interaction.data.member,
                                ),
                             ) as APIEmbed,
                          ],
                       }
                     : {}),
               });
            } catch (x) {
               const error = Embeds.ERROR_EMBED.toJSON();
               error.description = "This isn't valid! Try changing the Join DM Embed or Join DM Text.";
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
module.exports = joinDMCommand;
