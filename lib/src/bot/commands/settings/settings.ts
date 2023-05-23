import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/enums/Log';
import Modules from '@util/constants/Modules';
import { ILevelReward } from '@schemas/LevelRewardSchema';

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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const settings = await server.fetchSettings();
            const embed = Embeds.INFO_EMBED.toJSON();
            embed.title = '⚙️ Server Settings';
            embed.description = `🗒️ Log Channel: ${settings.log_channel ? `<#${settings.log_channel}>` : '`None`'}
            \r\n📩 Join/Leave Channel: ${settings.join_leave_channel ? `<#${settings.join_leave_channel}>` : '`None`'}
            \r\n🎤 Mute Role: ${settings.mute_role ? `<@&${settings.mute_role}>` : '`None`'}`;
            embed.fields = [
               {
                  name: '👋 Join Roles',
                  value: settings.join_roles.reduce(
                     (accumulator: string, val: string, index: number) =>
                        `${accumulator}\r\n> **${index + 1})** <@&${val}>`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '📝 Sticky Roles',
                  value: settings.sticky_roles.reduce(
                     (accumulator: string, val: string, index: number) =>
                        `${accumulator}\r\n> **${index + 1})** <@&${val}>`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '❓ Suggestions',
                  value: `> Channel: ${
                     settings.suggestions_channel
                        ? `<#${settings.suggestions_channel}>`
                        : '`None (Suggestions are disabled.)`'
                  }
                    > Updates Channel: ${
                       settings.suggestions_updates_channel ? `<#${settings.suggestions_updates_channel}>` : '`None`'
                    }
                    > Auto Delete: \`${settings.suggestions_auto_delete ? 'Delete.' : 'Do not Delete.'}\`
                    > Discussion Threads: \`${
                       settings.suggestions_discussion_threads ? 'Create Thread.' : 'Do not create a Thread.'
                    }\``,
               },
               {
                  name: '⛔ Disabled Features',
                  value: settings.disabled_modules.reduce(
                     (accumulator: string, val: string) => `${accumulator}\r\n> *${Modules[val]?.name || 'Unknown'}*`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '🏆 Level Reward Roles',
                  value: settings.level_rewards.reduce(
                     (accumulator: string, val: ILevelReward, index: number) =>
                        `${accumulator}\r\n> **${index + 1})** <@&${val.role_id}> (\`Level ${val.level}\`)`,
                     '',
                  ),
                  inline: true,
               },
               {
                  name: '⭐ Starboard',
                  value: `> Channel: ${
                     settings.starboard_channel ? `<#${settings.starboard_channel}>` : '`None (Starboard is disabled.)`'
                  }
                    > Reaction: ${settings.starboard_reaction || '`None (Starboard is disabled.)`'}
                    > Reaction Count: \`${settings.starboard_reaction_count}\``,
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const settings = await interaction.data.guildData.fetchSettings();
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = '⚙️ Log Channel Change';

            const formerChannel = interaction.data.guild.channels.resolve(settings.log_channel || '');
            if (channel && channel.id == settings.log_channel) {
               embed.description = `Nothing changed. Log channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            settings.log_channel = channel ? channel.id : undefined;
            await settings.save({ validateModifiedOnly: true });
            embed.description = `The log channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.LOG_CHANNEL_CHANGED,
               user_id: interaction.data.member.id,
               date_unix: Date.now(),
               description: 'The log channel for this server has been changed.',
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
         name: 'join_leave_channel',
         info: {
            module: Modules['Settings'],
            description: 'Change the channel where join and leave messages are broadcast.',
            usageExample: '/settings join_leave_channel (channel)',
            permission: 'settings.join_leave_channel',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
            const settings = await interaction.data.guildData.fetchSettings();
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = '⚙️ Join/Leave Channel Change';
            const formerChannel = interaction.data.guild.channels.resolve(settings.join_leave_channel || '');
            if (channel && channel.id == settings.join_leave_channel) {
               embed.description = `Nothing changed. Channel is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            settings.join_leave_channel = channel ? channel.id : undefined;
            await settings.save({ validateModifiedOnly: true });
            embed.description = `The Join/Leave channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.JOIN_LEAVE_CHANNEL_CHANGED,
               user_id: interaction.data.member.id,
               date_unix: Date.now(),
               description: 'The join/leave channel for this server has been changed.',
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
         name: 'mute_role',
         info: {
            module: Modules['Settings'],
            description: 'Change the mute role for the server, which is automatically assigned to muted users.',
            usageExample: '/settings mute_role (role)',
            permission: 'settings.mute_role',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const role = interaction.options.getRole('role', true);
            const settings = await interaction.data.guildData.fetchSettings();
            if (
               interaction.data.member.id != interaction.data.guild.ownerId &&
               interaction.data.guild.roles.comparePositions(interaction.data.member.roles.highest, role.id) <= 0
            ) {
               const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `This role is higher than yours!`;
               return await interaction.reply({
                  embeds: [noPermissionEmbed],
               });
            }
            if (interaction.data.guild.roles.comparePositions(interaction.data.member.roles.highest, role.id) <= 0) {
               const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
               noPermissionEmbed.title = '⛔ No Permission!';
               noPermissionEmbed.description = `This role is higher up on the role hierarchy than Auxdibot's roles!`;
               return await interaction.reply({
                  embeds: [noPermissionEmbed],
               });
            }
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = '⚙️ Mute Role Change';
            if (role.id == settings.mute_role) {
               embed.description = `Nothing changed. Mute role is the same as one specified in settings.`;
               return await interaction.reply({
                  embeds: [embed],
               });
            }
            const formerRole = interaction.data.guild.roles.cache.get(settings.mute_role || ''),
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
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.MUTE_ROLE_CHANGED,
               user_id: interaction.data.member.id,
               date_unix: Date.now(),
               description: 'The mute role for this server has been changed.',
               mute_role: {
                  former: formerRole ? formerRole.id : undefined,
                  now: role.id,
               },
            });
            settings.mute_role = role.id;
            await settings.save({ validateModifiedOnly: true });
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
