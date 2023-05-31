import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/config/Modules';
import { LogType } from '@/config/Log';
import Embeds from '@/config/embeds/Embeds';
import emojiRegex from 'emoji-regex';

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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const settings = await interaction.data.guildData.fetchSettings();
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = '⚙️ Starboard Channel Changed';

            const formerChannel = interaction.data.guild.channels.resolve(settings.starboard_channel || '');
            if ((channel && channel.id == settings.starboard_channel) || (!channel && !settings.starboard_channel)) {
               embed.description = `Nothing changed. Starboard channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            settings.starboard_channel = channel ? channel.id : undefined;
            await settings.save();
            embed.description = `The starboard channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;

            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.STARBOARD_CHANNEL_CHANGED,
               user_id: interaction.data.member.id,
               date_unix: Date.now(),
               description: 'The starboard channel for this server has been changed.',
               channel: {
                  former: formerChannel?.id,
                  now: channel?.id,
               },
            });
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const settings = await server.fetchSettings();
            const reaction = interaction.options.getString('reaction', true);
            const regex = emojiRegex();
            const emojis = reaction.match(regex);
            const emoji =
               interaction.client.emojis.cache.find((i) => i.toString() == reaction) ||
               (emojis != null ? emojis[0] : null);
            if (!emoji) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This isn't a valid reaction!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (settings.starboard_reaction == emoji) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'The starboard reaction is the same as the one specified!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            settings.starboard_reaction = typeof emoji == 'string' ? emoji : emoji.toString();
            await settings.save();
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.STARBOARD_REACTION_CHANGED,
               user_id: interaction.data.member.id,
               date_unix: Date.now(),
               description: `The starboard reaction for this server has been set to ${emoji}.`,
            });
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const settings = await server.fetchSettings();
            const reaction_count = interaction.options.getNumber('reaction_count', true);
            if (reaction_count <= 0) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'The reaction count cannot be less than or equal to zero!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (settings.starboard_reaction_count == reaction_count) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'The starboard reaction count is the same as the one specified!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            settings.starboard_reaction_count = reaction_count;
            await settings.save();
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.STARBOARD_REACTION_COUNT_CHANGED,
               user_id: interaction.data.member.id,
               date_unix: Date.now(),
               description: `The starboard reaction count for this server has been set to ${reaction_count}.`,
            });
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
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
