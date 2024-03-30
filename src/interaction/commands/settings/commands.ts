import Modules from '@/constants/bot/commands/Modules';
import bypassRolesAdd from '@/interaction/subcommands/commands/bypass_roles/bypassRolesAdd';
import bypassRolesRemove from '@/interaction/subcommands/commands/bypass_roles/bypassRolesRemove';
import channelBlacklistAdd from '@/interaction/subcommands/commands/channel/channelBlacklistAdd';
import channelBlacklistRemove from '@/interaction/subcommands/commands/channel/channelBlacklistRemove';
import channelRequireAdd from '@/interaction/subcommands/commands/channel/channelRequireAdd';
import channelRequireRemove from '@/interaction/subcommands/commands/channel/channelRequireRemove';
import commandsAdminSet from '@/interaction/subcommands/commands/commandsAdminSet';
import commandsOutputSet from '@/interaction/subcommands/commands/commandsOutputSet';
import commandsRulesDelete from '@/interaction/subcommands/commands/commandsRulesDelete';
import commandsRulesView from '@/interaction/subcommands/commands/commandsRulesView';
import roleBlacklistAdd from '@/interaction/subcommands/commands/role/roleBlacklistAdd';
import roleBlacklistRemove from '@/interaction/subcommands/commands/role/roleBlacklistRemove';
import roleRequireAdd from '@/interaction/subcommands/commands/role/roleRequireAdd';
import roleRequireRemove from '@/interaction/subcommands/commands/role/roleRequireRemove';
import commandsUsageChannel from '@/interaction/subcommands/commands/usage/commandsUsageChannel';
import commandsUsageDisable from '@/interaction/subcommands/commands/usage/commandsUsageDisable';
import commandsUsageEnable from '@/interaction/subcommands/commands/usage/commandsUsageEnable';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { ChannelType, SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('commands')
      .setDescription("Manage access for all of Auxdibot's commands.")
      .addSubcommandGroup((builder) =>
         builder
            .setName('role')
            .setDescription('Blacklist/require roles to use commands.')
            .addSubcommand((builder) =>
               builder
                  .setName('blacklist')
                  .setDescription('Blacklist a role from using commands.')
                  .addRoleOption((option) =>
                     option.setName('role').setDescription('The role to blacklist.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to apply the blacklist to.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('require')
                  .setDescription('Require a role to use commands.')
                  .addRoleOption((option) =>
                     option.setName('role').setDescription('The role to require.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to apply the requirement to.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('unblacklist')
                  .setDescription('Unblacklist a role from using commands.')
                  .addRoleOption((option) =>
                     option.setName('role').setDescription('The role to unblacklist.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to remove the blacklist from.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('unrequire')
                  .setDescription('Unrequire a role to use commands.')
                  .addRoleOption((option) =>
                     option.setName('role').setDescription('The role to unrequire.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to remove the requirement from.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('channel')
            .setDescription('Blacklist/require channel usage for commands.')
            .addSubcommand((builder) =>
               builder
                  .setName('blacklist')
                  .setDescription('Blacklist a channel, no longer allowing the command to be run in that channel.')
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to blacklist.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to apply the blacklist to.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('require')
                  .setDescription('Require a channel to use commands.')
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to require.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to apply the requirement to.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('unblacklist')
                  .setDescription('Unblacklist a channel where a command cannot be run.')
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to unblacklist.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to remove the blacklist from.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('unrequire')
                  .setDescription('Unrequire a channel where a command is limited to.')
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to unrequire.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to remove the requirement from.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('bypass_roles')
            .setDescription('Add/remove roles that bypass Discord permissions when running a command.')
            .addSubcommand((builder) =>
               builder
                  .setName('add')
                  .setDescription('Add a role that bypasses Discord permissions.')
                  .addRoleOption((option) =>
                     option.setName('role').setDescription('The role to add.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option.setName('command').setDescription('The command to apply the bypass to.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove')
                  .setDescription('Remove a role that bypasses Discord permissions.')
                  .addRoleOption((option) =>
                     option.setName('role').setDescription('The role to remove.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to remove the bypass from.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('admin')
            .setDescription('Set whether a command is allowed exclusively for Discord Administrators.')
            .addSubcommand((builder) =>
               builder
                  .setName('set')
                  .setDescription('Set whether a command is allowed exclusively for Discord Administrators.')
                  .addStringOption((option) =>
                     option.setName('command').setDescription('The command to toggle.').setRequired(true),
                  )
                  .addBooleanOption((option) =>
                     option
                        .setName('admin_only')
                        .setDescription('Whether the command is allowed for exclusively Discord Administrators.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('output')
            .setDescription("Set the channel that a command's output is broadcast to.")
            .addSubcommand((builder) =>
               builder
                  .setName('set')
                  .setDescription("Set the channel that a command's output is broadcast to.")
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to set the broadcast channel for.')
                        .setRequired(true),
                  )
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to broadcast to.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('rules')
            .setDescription('View the rules you have configured for permissions.')
            .addSubcommand((builder) =>
               builder.setName('view').setDescription('View the rules you have configured for permissions.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('delete')
                  .setDescription('Clear the rules set for a command.')
                  .addStringOption((option) =>
                     option.setName('command').setDescription('The command to clear the rules for.').setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('usage')
            .setDescription('Enable or disable the usage of a command.')
            .addSubcommand((builder) =>
               builder
                  .setName('enable')
                  .setDescription('Enable the usage of a command.')
                  .addStringOption((option) =>
                     option.setName('command').setDescription('The command to enable.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('disable')
                  .setDescription('Disable the usage of a command.')
                  .addStringOption((option) =>
                     option.setName('command').setDescription('The command to disable.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('channel')
                  .setDescription('Set the channel where Auxdibot commands can be executed.')
                  .addStringOption((option) =>
                     option.setName('command').setDescription('The command to set the channel for.').setRequired(true),
                  )
                  .addChannelOption((option) =>
                     option
                        .setName('channel')
                        .setDescription('The channel to restrict the command to.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
                  ),
            ),
      ),
   info: {
      module: Modules['Settings'],
      description: "Manage access for all of Auxdibot's commands.",
      usageExample: '/commands',
   },
   subcommands: [
      commandsAdminSet,
      commandsOutputSet,
      bypassRolesAdd,
      bypassRolesRemove,
      commandsRulesView,
      channelBlacklistAdd,
      channelBlacklistRemove,
      channelRequireAdd,
      channelRequireRemove,
      roleBlacklistAdd,
      roleBlacklistRemove,
      roleRequireAdd,
      roleRequireRemove,
      commandsUsageEnable,
      commandsUsageDisable,
      commandsRulesDelete,
      commandsUsageChannel,
   ],
   async execute() {
      return;
   },
};
