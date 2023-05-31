import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Embeds from '@/config/embeds/Embeds';
import { IPermissionOverride } from '@/mongo/schema/PermissionOverrideSchema';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { LogType } from '@/config/Log';
import Modules from '@/config/Modules';

const permissionsCommand = <AuxdibotCommand>{
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
      usageExample: '/permissions [view|create|delete|list]',
      permission: 'permissions',
   },
   subcommands: [
      {
         name: 'view',
         info: {
            module: Modules['Permissions'],
            description: 'View a permission override.',
            usageExample: '/permissions view (override_id)',
            permission: 'permissions.view',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const override_id = interaction.options.getNumber('override_id', true);
            const data = await interaction.data.guildData.fetchData();
            const permission = data.permission_overrides[override_id - 1];
            if (permission) {
               const embed = Embeds.SUCCESS_EMBED.toJSON();
               embed.title = `✋ Permission Override (OID: ${override_id + 1})`;
               embed.description = '';
               embed.fields = [
                  {
                     name: 'Permission Override',
                     value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
                        permission.role_id
                           ? `<@&${permission.role_id}>`
                           : permission.user_id
                           ? `<@${permission.user_id}>`
                           : ''
                     }`,
                  },
               ];
               return await interaction.reply({ embeds: [embed] });
            }
         },
      },
      {
         name: 'create',
         info: {
            module: Modules['Permissions'],
            description: 'Create a permission override.',
            usageExample: '/permissions create (permission) (role|user) (allowed)',
            permission: 'permissions.create',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const user = interaction.options.getUser('user'),
               permission = interaction.options.getString('permission', true),
               role = interaction.options.getRole('role'),
               allowed = interaction.options.getBoolean('allowed', true);
            if (!role && !user) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'No arguments provided for the role or user!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }

            const permissionOverride = <IPermissionOverride>{
               user_id: user ? user.id : undefined,
               role_id: role ? role.id : undefined,
               permission: permission,
               allowed,
            };
            const add_permission_override = await interaction.data.guildData.addPermissionOverride(permissionOverride);
            if ('error' in add_permission_override) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = add_permission_override.error;
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const data = await interaction.data.guildData.fetchData();
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = '✋ Added Permission Override';
            embed.description = `Created a new permission override for ${
               permissionOverride.user_id
                  ? `<@${permissionOverride.user_id}>`
                  : permissionOverride.role_id
                  ? `<@&${permissionOverride.role_id}>`
                  : 'None'
            } for permission \`${permissionOverride.permission}\``;
            embed.fields = [
               {
                  name: `Permission Override (OID: ${data.permission_overrides.length})`,
                  value: `${allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
                     permissionOverride.role_id
                        ? `<@&${permissionOverride.role_id}>`
                        : permissionOverride.user_id
                        ? `<@${permissionOverride.user_id}>`
                        : ''
                  }`,
               },
            ];
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.PERMISSION_CREATED,
               permission_override: permissionOverride,
               date_unix: Date.now(),
               user_id: interaction.user.id,
               description: `${interaction.user.tag} created a permission override. (OID: ${data.permission_overrides.length})`,
            });

            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'delete',
         info: {
            module: Modules['Permissions'],
            description: 'Delete a permission override.',
            usageExample: '/permissions delete (override_id)',
            permission: 'permissions.delete',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const override_id = interaction.options.getNumber('override_id', true);
            const data = await interaction.data.guildData.fetchData();
            const permission = data.permission_overrides[override_id - 1];
            if (!permission) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = "This permission override doesn't exist!";
               return await interaction.reply({ embeds: [embed] });
            }
            data.permission_overrides.splice(override_id - 1, 1);
            await data.save({ validateBeforeSave: false });
            const embed = Embeds.SUCCESS_EMBED.toJSON();
            embed.title = '✋ Deleted Permission Override';
            embed.description = `Deleted permission override with override id \`${override_id}\`.`;
            embed.fields = [
               {
                  name: 'Permission Override',
                  value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
                     permission.role_id
                        ? `<@&${permission.role_id}>`
                        : permission.user_id
                        ? `<@${permission.user_id}>`
                        : ''
                  }`,
               },
            ];
            await interaction.data.guildData.log(interaction.data.guild, {
               type: LogType.PERMISSION_DELETED,
               permission_override: permission,
               date_unix: Date.now(),
               user_id: interaction.user.id,
               description: `${interaction.user.tag} deleted a permission override. (OID: ${override_id})`,
            });
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'list',
         info: {
            module: Modules['Permissions'],
            description: 'List all permission overrides.',
            usageExample: '/permissions list',
            permission: 'permissions.list',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const data = await interaction.data.guildData.fetchData();
            const embed = Embeds.DEFAULT_EMBED.toJSON();
            embed.title = '✋ Permission Overrides';
            embed.description = 'Use the OID to delete or view a permission override.';
            embed.fields = [
               {
                  name: `Permission Overrides for ${interaction.data.guild.name}`,
                  value: data.permission_overrides.reduce(
                     (accumulator, permissionOverride, index) =>
                        accumulator +
                        `\n**OID ${index + 1}**) ${permissionOverride.allowed ? '✅' : '❎'} \`${
                           permissionOverride.permission
                        }\` - ${
                           permissionOverride.role_id
                              ? `<@&${permissionOverride.role_id}>`
                              : permissionOverride.user_id
                              ? `<@${permissionOverride.user_id}>`
                              : ''
                        }`,
                     '',
                  ),
               },
            ];
            return await interaction.reply({ embeds: [embed] });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = permissionsCommand;
