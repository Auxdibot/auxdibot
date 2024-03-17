import Modules from '@/constants/bot/commands/Modules';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('commands')
      .setDescription("View all of Auxdibot's commands.")
      .addSubcommandGroup((builder) =>
         builder
            .setName('role')
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
            .addSubcommand((builder) =>
               builder
                  .setName('blacklist')
                  .setDescription('Blacklist a channel from using commands.')
                  .addChannelOption((option) =>
                     option.setName('channel').setDescription('The channel to blacklist.').setRequired(true),
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
                     option.setName('channel').setDescription('The channel to require.').setRequired(true),
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
                  .setDescription('Unblacklist a channel from using commands.')
                  .addChannelOption((option) =>
                     option.setName('channel').setDescription('The channel to unblacklist.').setRequired(true),
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
                  .setDescription('Unrequire a channel to use commands.')
                  .addChannelOption((option) =>
                     option.setName('channel').setDescription('The channel to unrequire.').setRequired(true),
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
         builder.setName('admin').addSubcommand((builder) =>
            builder
               .setName('toggle')
               .setDescription('Toggle whether a command is allowed only to Discord Administrators.')
               .addStringOption((option) =>
                  option.setName('command').setDescription('The command to toggle.').setRequired(true),
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
                  .addChannelOption((option) =>
                     option.setName('channel').setDescription('The channel to broadcast to.').setRequired(true),
                  )
                  .addStringOption((option) =>
                     option
                        .setName('command')
                        .setDescription('The command to set the broadcast channel for.')
                        .setRequired(true),
                  ),
            ),
      ),
   info: {
      module: Modules['General'],
      description: "View all of Auxdibot's commands.",
      usageExample: '/commands',
      allowedDefault: true,
      permission: 'commands.commands',
      dmableCommand: true,
   },
   async execute() {
      return;
   },
};
