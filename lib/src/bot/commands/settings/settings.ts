import { EmbedBuilder, ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LevelReward, LogAction } from '@prisma/client';

const settingsCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('settings')
      .setDescription('Change settings for the server.')
      .addSubcommand((builder) =>
         builder
            .setName('log_channel')
            .setDescription('Change the channel where log messages are broadcast.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to broadcast all logs to.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('join_leave_channel')
            .setDescription('Change the channel where join and leave messages are broadcast.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to broadcast join and leave messages to.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('mute_role')
            .setDescription('Change the mute role for this server.')
            .addRoleOption((builder) => builder.setName('role').setDescription('The role to apply when muted.')),
      )
      .addSubcommand((builder) => builder.setName('view').setDescription("View this server's settings.")),
   info: {
      module: Modules['Settings'],
      description: 'Change settings for the server.',
      usageExample: '/settings (view|log_channel|mute_role)',
      permission: 'settings',
   },
   subcommands: [
      {
         name: 'view',
         info: {
            module: Modules['Settings'],
            description: 'View all settings for the server.',
            usageExample: '/settings view',
            permission: 'settings.view',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            embed.title = '⚙️ Server Settings';
            embed.description = `🗒️ Log Channel: ${server.log_channel ? `<#${server.log_channel}>` : '`None`'}
            \r\n📩 Join/Leave Channel: ${server.join_leave_channel ? `<#${server.join_leave_channel}>` : '`None`'}
            \r\n🎤 Mute Role: ${server.mute_role ? `<@&${server.mute_role}>` : '`None`'}
            \r\n💬 Message XP: \`${server.message_xp}\``;
            embed.fields = [
               {
                  name: '👋 Join Roles',
                  value: server.join_roles.reduce(
                     (accumulator: string, val: string, index: number) =>
                        `${accumulator}\r\n> **${index + 1})** <@&${val}>`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '📝 Sticky Roles',
                  value: server.sticky_roles.reduce(
                     (accumulator: string, val: string, index: number) =>
                        `${accumulator}\r\n> **${index + 1})** <@&${val}>`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '❓ Suggestions',
                  value: `> Channel: ${
                     server.suggestions_channel
                        ? `<#${server.suggestions_channel}>`
                        : '`None (Suggestions are disabled.)`'
                  }
                    > Updates Channel: ${
                       server.suggestions_updates_channel ? `<#${server.suggestions_updates_channel}>` : '`None`'
                    }
                    > Auto Delete: \`${server.suggestions_auto_delete ? 'Delete.' : 'Do not Delete.'}\`
                    > Discussion Threads: \`${
                       server.suggestions_discussion_threads ? 'Create Thread.' : 'Do not create a Thread.'
                    }\``,
               },
               {
                  name: '⛔ Disabled Features',
                  value: server.disabled_modules.reduce(
                     (accumulator: string, val: string) => `${accumulator}\r\n> *${Modules[val]?.name || 'Unknown'}*`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '🏆 Level Reward Roles',
                  value: server.level_rewards.reduce(
                     (accumulator: string, val: LevelReward, index: number) =>
                        `${accumulator}\r\n> **${index + 1})** <@&${val.roleID}> (\`Level ${val.level}\`)`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '⭐ Starboard',
                  value: `> Channel: ${
                     server.starboard_channel ? `<#${server.starboard_channel}>` : '`None (Starboard is disabled.)`'
                  }
                    > Reaction: ${server.starboard_reaction || '`None (Starboard is disabled.)`'}
                    > Reaction Count: \`${server.starboard_reaction_count}\``,
               },
            ];
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
      {
         name: 'log_channel',
         info: {
            module: Modules['Settings'],
            description: 'Change the log channel for the server, where all actions are logged to.',
            usageExample: '/settings log_channel (channel)',
            permission: 'settings.log_channel',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Log Channel Change';

            const formerChannel = interaction.data.guild.channels.resolve(server.log_channel || '');
            if (channel && channel.id == server.log_channel) {
               embed.description = `Nothing changed. Log channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            server.log_channel = channel ? channel.id : undefined;
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { log_channel: channel?.id || undefined },
            });
            embed.description = `The log channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.LOG_CHANNEL_CHANGED,
                  userID: interaction.data.member.id,
                  date_unix: Date.now(),
                  description: 'The log channel for this server has been changed.',
               },
               [
                  {
                     name: 'Log Channel Change',
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
         name: 'join_leave_channel',
         info: {
            module: Modules['Settings'],
            description: 'Change the channel where join and leave messages are broadcast.',
            usageExample: '/settings join_leave_channel (channel)',
            permission: 'settings.join_leave_channel',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Join/Leave Channel Change';
            const formerChannel = interaction.data.guild.channels.resolve(server.join_leave_channel || '');
            if (channel && channel.id == server.join_leave_channel) {
               embed.description = `Nothing changed. Channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            server.join_leave_channel = channel ? channel.id : undefined;
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { join_leave_channel: channel?.id || undefined },
            });
            embed.description = `The Join/Leave channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.JOIN_LEAVE_CHANNEL_CHANGED,
                  userID: interaction.data.member.id,
                  date_unix: Date.now(),
                  description: 'The join/leave channel for this server has been changed.',
               },
               [
                  {
                     name: 'Join/Leave Channel Change',
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
         name: 'mute_role',
         info: {
            module: Modules['Settings'],
            description: 'Change the mute role for the server, which is automatically assigned to muted users.',
            usageExample: '/settings mute_role (role)',
            permission: 'settings.mute_role',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const role = interaction.options.getRole('role', true);
            const server = interaction.data.guildData;
            if (
               interaction.data.member.id != interaction.data.guild.ownerId &&
               interaction.data.guild.roles.comparePositions(interaction.data.member.roles.highest, role.id) <= 0
            ) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `This role is higher than yours!`;
               return await interaction.reply({
                  embeds: [noPermissionEmbed],
               });
            }
            if (interaction.data.guild.roles.comparePositions(interaction.data.member.roles.highest, role.id) <= 0) {
               const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `This role is higher up on the role hierarchy than Auxdibot's roles!`;
               return await interaction.reply({
                  embeds: [noPermissionEmbed],
               });
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Mute Role Change';
            if (role.id == server.mute_role) {
               embed.description = `Nothing changed. Mute role is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            const formerRole = interaction.data.guild.roles.cache.get(server.mute_role || ''),
               guildRole = interaction.data.guild.roles.cache.get(role.id);
            if (guildRole) {
               await guildRole.setPermissions([], 'Clearing all permissions.').catch(() => undefined);
               interaction.data.guild.channels.cache.forEach((r) => {
                  if (r.isDMBased() || r.isThread() || !guildRole) return;
                  r.permissionOverwrites.create(guildRole, {
                     SendMessages: false,
                     SendMessagesInThreads: false,
                     AddReactions: false,
                  });
                  if (r.isVoiceBased())
                     r.permissionOverwrites.create(guildRole, {
                        Connect: false,
                     });
               });
            }
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.MUTE_ROLE_CHANGED,
                  userID: interaction.data.member.id,
                  date_unix: Date.now(),
                  description: `The mute role for this server has been changed to ${role.name}.`,
               },
               [
                  {
                     name: 'Mute Role Change',
                     value: `Formerly: ${formerRole ? `<@&${formerRole.id}>` : undefined}\n\nNow: <@&${role.id}>`,
                     inline: false,
                  },
               ],
            );
            server.mute_role = role.id;
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { mute_role: role.id },
            });
            embed.description = `The mute role for this server has been changed.\r\n\r\nFormerly: ${
               formerRole ? `<@&${formerRole.id}>` : 'None'
            }\r\n\r\nNow: <@&${role.id}>`;
            return await interaction.reply({
               embeds: [embed],
            });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = settingsCommand;
