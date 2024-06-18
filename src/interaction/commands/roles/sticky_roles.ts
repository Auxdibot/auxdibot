import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { stickyRoleAdd } from '../../subcommands/roles/sticky_roles/stickyRoleAdd';
import { stickyRoleRemove } from '../../subcommands/roles/sticky_roles/stickyRoleRemove';
import { stickyRoleList } from '../../subcommands/roles/sticky_roles/stickyRoleList';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('sticky_roles')
      .setDescription('Change the roles that are kept when a member rejoins the server.')
      .addSubcommand((builder) =>
         builder
            .setName('add')
            .setDescription('Add a role to be kept when a member rejoins the server.')
            .addRoleOption((argBuilder) =>
               argBuilder
                  .setName('role')
                  .setDescription('The role to be kept when a member rejoins the server.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove')
            .setDescription('Remove a role that is kept when a member rejoins the server.')
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role to be kept when a member rejoins the server.'),
            )
            .addNumberOption((argBuilder) =>
               argBuilder
                  .setName('index')
                  .setDescription(
                     'The index of the sticky role to remove, which is the placement of the item on /sticky_roles list',
                  ),
            ),
      )
      .addSubcommand((builder) =>
         builder.setName('list').setDescription('List the roles that are kept when a member rejoins the server.'),
      ),
   info: {
      module: Modules['Roles'],
      description: 'Change the roles that are kept when a member rejoins the server.',
      usageExample: '/sticky_roles (add|remove|list)',
      permissionsRequired: [PermissionFlagsBits.ManageRoles],
   },
   subcommands: [stickyRoleAdd, stickyRoleRemove, stickyRoleList],
   async execute() {
      return;
   },
};
