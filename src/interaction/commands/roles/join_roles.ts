import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { joinRoleAdd } from '../../subcommands/roles/join_roles/joinRoleAdd';
import { joinRoleRemove } from '../../subcommands/roles/join_roles/joinRoleRemove';
import { joinRoleList } from '../../subcommands/roles/join_roles/joinRoleList';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('join_roles')
      .setDescription('Change the roles given when a member joins the server.')
      .addSubcommand((builder) =>
         builder
            .setName('add')
            .setDescription('Add a role to be assigned when a member joins the server.')
            .addRoleOption((argBuilder) =>
               argBuilder
                  .setName('role')
                  .setDescription('The role to be assigned when a member joins the server.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove')
            .setDescription('Remove a role that is assigned when a member joins the server.')
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role to be assigned when a member joins the server.'),
            )
            .addNumberOption((argBuilder) =>
               argBuilder
                  .setName('index')
                  .setDescription(
                     'The index of the join role to remove, which is the placement of the item on /join_roles list',
                  ),
            ),
      )
      .addSubcommand((builder) =>
         builder.setName('list').setDescription('List the roles that are assigned when a member joins the server.'),
      ),
   info: {
      module: Modules['Roles'],
      description: 'Change the roles given when a member joins the server.',
      usageExample: '/join_roles (add|remove|list)',
      permissionsRequired: [PermissionFlagsBits.ManageRoles],
   },
   subcommands: [joinRoleAdd, joinRoleRemove, joinRoleList],
   async execute() {
      return;
   },
};
