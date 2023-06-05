import { EmbedBuilder, ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import emojiRegex from 'emoji-regex';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import handleError from '@/util/handleError';

const starboardCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('starboard')
      .setDescription('Change the starboard settings for this server.')
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Set the channel where starred messages are sent.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to send starred messages to.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('reaction')
            .setDescription('Set the starboard reaction for this server.')
            .addStringOption((builder) =>
               builder
                  .setName('reaction')
                  .setDescription("The reaction to use for this server's starboard.")
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('reaction_count')
            .setDescription('Set the starboard reaction count for this server.')
            .addNumberOption((builder) =>
               builder
                  .setName('reaction_count')
                  .setDescription('The reaction count for a message to reach before being posted to the starboard.')
                  .setRequired(true),
            ),
      ),
   info: {
      module: Modules['Starboard'],
      description: 'Change the starboard settings for this server.',
      usageExample: '/starboard (stats|channel|reaction|reaction_count)',
      permission: 'starboard',
   },
   subcommands: [
      {
         name: 'channel',
         info: {
            module: Modules['Starboard'],
            description: 'Set the channel where starred messages are sent.',
            usageExample: '/starboard channel (channel)',
            permission: 'starboard.settings.channel',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Starboard Channel Changed';

            const formerChannel = interaction.data.guild.channels.resolve(server.starboard_channel || '');
            if ((channel && channel.id == server.starboard_channel) || (!channel && !server.starboard_channel)) {
               embed.description = `Nothing changed. Starboard channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { starboard_channel: channel.id },
            });
            embed.description = `The starboard channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;

            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.STARBOARD_CHANNEL_CHANGED,
                  userID: interaction.data.member.id,
                  date_unix: Date.now(),
                  description: `The starboard channel for this server has been changed.`,
               },
               [
                  {
                     name: 'Starboard Channel Change',
                     value: `Formerly: ${formerChannel}\n\nNow: ${channel}`,
                     inline: false,
                  },
               ],
            );
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
      {
         name: 'reaction',
         info: {
            module: Modules['Starboard'],
            description: 'Set the starboard reaction for this server.',
            usageExample: '/starboard reaction (reaction)',
            permission: 'starboard.settings.reaction',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const reaction = interaction.options.getString('reaction', true);
            const regex = emojiRegex();
            const emojis = reaction.match(regex);
            const emoji =
               interaction.client.emojis.cache.find((i) => i.toString() == reaction) ||
               (emojis != null ? emojis[0] : null);
            if (!emoji) {
               return await handleError(auxdibot, 'INVALID_REACTION', "This isn't a valid reaction!", interaction);
            }
            if (server.starboard_reaction == emoji) {
               return await handleError(
                  auxdibot,
                  'STARBOARD_REACTION_IDENTICAL',
                  'The reaction specified is the same as the current starboard reaction!',
                  interaction,
               );
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { starboard_reaction: typeof emoji == 'string' ? emoji : emoji.toString() },
            });
            await handleLog(auxdibot, interaction.data.guild, {
               type: LogAction.STARBOARD_REACTION_CHANGED,
               userID: interaction.data.member.id,
               date_unix: Date.now(),
               description: `The starboard reaction for this server has been set to ${emoji}.`,
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Set ${emoji} as the starboard reaction.`;
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'reaction_count',
         info: {
            module: Modules['Starboard'],
            description: 'Set the starboard reaction count for this server.',
            usageExample: '/starboard reaction_count (reaction_count)',
            permission: 'starboard.settings.reaction_count',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const reaction_count = interaction.options.getNumber('reaction_count', true);
            if (reaction_count <= 0) {
               return await handleError(
                  auxdibot,
                  'REACTION_COUNT_INVALID',
                  'The reaction count cannot be negative or zero!',
                  interaction,
               );
            }
            if (server.starboard_reaction_count == reaction_count) {
               return await handleError(
                  auxdibot,
                  'REACTION_COUNT_INDENTICAL',
                  'The reaction count specified is the same as the current starboard reaction count!',
                  interaction,
               );
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { starboard_reaction_count: reaction_count },
            });
            await handleLog(auxdibot, interaction.data.guild, {
               type: LogAction.STARBOARD_REACTION_COUNT_CHANGED,
               userID: interaction.data.member.id,
               date_unix: Date.now(),
               description: `The starboard reaction count for this server has been set to ${reaction_count}.`,
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.description = `Set ${reaction_count} as the starboard reaction count. When a message is reacted with the starboard reaction ${reaction_count} times, it will be added to the starboard.`;
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = starboardCommand;
