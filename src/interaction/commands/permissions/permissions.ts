import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { permissionsView } from '../../subcommands/permissions/permissionsView';
import { permissionsCreate } from '../../subcommands/permissions/permissionsCreate';
import { permissionsDelete } from '../../subcommands/permissions/permissionsDelete';
import { permissionsList } from '../../subcommands/permissions/permissionsList';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('permissions')
      .setDescription('Edit, view, or delete permissions and permission overrides.')
      .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all overrides.'))
      .addSubcommand((subcommand) =>
         subcommand
            .setName('delete')
            .setDescription('Delete an override using the override id.')
            .addNumberOption((builder) =>
               builder.setName('override_id').setDescription('The override id to delete.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('view')
            .setDescription('View an override using the override id.')
            .addNumberOption((builder) =>
               builder.setName('override_id').setDescription('The override id to view.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('create')
            .setDescription('Create an override.')
            .addStringOption((builder) =>
               builder.setName('permission').setDescription('The permission to add.').setRequired(true),
            )
            .addBooleanOption((builder) =>
               builder
                  .setName('allowed')
                  .setDescription('Whether the user is allowed to use this permission.')
                  .setRequired(true),
            )
            .addRoleOption((builder) => builder.setName('role').setDescription('The role id to view.'))
            .addUserOption((builder) => builder.setName('user').setDescription('The user id to view.')),
      ),
   info: {
      module: Modules['Permissions'],
      description: 'Edit, view, delete or list permission overrides.',
      usageExample: '/permissions (view|create|delete|list)',
   },
   subcommands: [permissionsView, permissionsCreate, permissionsDelete, permissionsList],
   async execute() {
      return;
   },
};
