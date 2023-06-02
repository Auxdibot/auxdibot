import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import handleLog from '@/util/handleLog';
import { LogAction, PermissionOverride } from '@prisma/client';

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
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const override_id = interaction.options.getNumber('override_id', true);
            const server = await interaction.data.guildData;
            const permission = server.permission_overrides[override_id - 1];
            if (permission) {
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               embed.title = `✋ Permission Override (OID: ${override_id + 1})`;
               embed.description = '';
               embed.fields = [
                  {
                     name: 'Permission Override',
                     value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
                        permission.roleID
                           ? `<@&${permission.roleID}>`
                           : permission.userID
                           ? `<@${permission.roleID}>`
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
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const user = interaction.options.getUser('user'),
               permission = interaction.options.getString('permission', true),
               role = interaction.options.getRole('role'),
               allowed = interaction.options.getBoolean('allowed', true);
            if (!role && !user) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'No arguments provided for the role or user!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }

            const permissionOverride = <PermissionOverride>{
               userID: user ? user.id : undefined,
               roleID: role ? role.id : undefined,
               permission: permission,
               allowed,
            };
            if (
               !testLimit(interaction.data.guildData.permission_overrides, Limits.PERMISSION_OVERRIDES_DEFAULT_LIMIT)
            ) {
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = 'You have too many permission overrides!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            await auxdibot.database.servers.update({
               where: { serverID: interaction.data.guildData.serverID },
               data: { permission_overrides: { push: permissionOverride } },
            });
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '✋ Added Permission Override';
            embed.description = `Created a new permission override for ${
               permissionOverride.userID
                  ? `<@${permissionOverride.userID}>`
                  : permissionOverride.roleID
                  ? `<@&${permissionOverride.roleID}>`
                  : 'None'
            } for permission \`${permissionOverride.permission}\``;
            embed.fields = [
               {
                  name: `Permission Override (OID: ${interaction.data.guildData.permission_overrides.length + 1})`,
                  value: `${allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
                     permissionOverride.roleID
                        ? `<@&${permissionOverride.roleID}>`
                        : permissionOverride.userID
                        ? `<@${permissionOverride.userID}>`
                        : ''
                  }`,
               },
            ];
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.PERMISSION_CREATED,
                  date_unix: Date.now(),
                  userID: interaction.user.id,
                  description: `${interaction.user.tag} created a permission override. (OID: ${interaction.data.guildData.permission_overrides.length})`,
               },
               [
                  {
                     name: `Permission Override (OID: ${interaction.data.guildData.permission_overrides.length + 1})`,
                     value: `${allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
                        permissionOverride.roleID
                           ? `<@&${permissionOverride.roleID}>`
                           : permissionOverride.userID
                           ? `<@${permissionOverride.userID}>`
                           : ''
                     }`,
                     inline: false,
                  },
               ],
            );

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
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const override_id = interaction.options.getNumber('override_id', true);
            const server = interaction.data.guildData;
            const permission = server.permission_overrides[override_id - 1];
            if (!permission) {
               const embed = auxdibot.embeds.error.toJSON();
               embed.description = "This permission override doesn't exist!";
               return await interaction.reply({ embeds: [embed] });
            }
            server.permission_overrides.splice(override_id - 1, 1);
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { permission_overrides: server.permission_overrides },
            });
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '✋ Deleted Permission Override';
            embed.description = `Deleted permission override with override id \`${override_id}\`.`;
            embed.fields = [
               {
                  name: 'Permission Override',
                  value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
                     permission.roleID ? `<@&${permission.roleID}>` : permission.userID ? `<@${permission.userID}>` : ''
                  }`,
               },
            ];
            await handleLog(
               auxdibot,
               interaction.data.guild,
               {
                  type: LogAction.PERMISSION_DELETED,
                  date_unix: Date.now(),
                  userID: interaction.user.id,
                  description: `${interaction.user.tag} deleted a permission override. (OID: ${override_id})`,
               },
               [
                  {
                     name: 'Permission Override',
                     value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
                        permission.roleID
                           ? `<@&${permission.roleID}>`
                           : permission.userID
                           ? `<@${permission.userID}>`
                           : ''
                     }`,
                     inline: false,
                  },
               ],
            );
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
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
            embed.title = '✋ Permission Overrides';
            embed.description = 'Use the OID to delete or view a permission override.';
            embed.fields = [
               {
                  name: `Permission Overrides for ${interaction.data.guild.name}`,
                  value: server.permission_overrides.reduce(
                     (accumulator, permissionOverride, index) =>
                        accumulator +
                        `\n**OID ${index + 1}**) ${permissionOverride.allowed ? '✅' : '❎'} \`${
                           permissionOverride.permission
                        }\` - ${
                           permissionOverride.roleID
                              ? `<@&${permissionOverride.roleID}>`
                              : permissionOverride.userID
                              ? `<@${permissionOverride.userID}>`
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
