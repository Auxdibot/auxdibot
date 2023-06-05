import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import Limits from '@/constants/database/Limits';
import { testLimit } from '@/util/testLimit';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import handleError from '@/util/handleError';

const stickyRolesCommand = <AuxdibotCommand>{
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
      module: Modules['Settings'],
      description: 'Change the roles that are kept when a member rejoins the server.',
      usageExample: '/sticky_roles (add|remove|list)',
      permission: 'settings.sticky_roles',
   },
   subcommands: [
      {
         name: 'add',
         info: {
            module: Modules['Settings'],
            description: 'Add a role to be kept when a member rejoins the server.',
            usageExample: '/sticky_roles add (role)',
            permission: 'settings.sticky_roles.add',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const role = interaction.options.getRole('role', true);
            const server = interaction.data.guildData;
            if (role.id == interaction.data.guild.roles.everyone.id) {
               return await handleError(
                  auxdibot,
                  'STICKY_ROLE_EVERYONE',
                  'This is the everyone role, silly!',
                  interaction,
               );
            }
            if (server.sticky_roles.find((val: string) => role != null && val == role.id)) {
               return await handleError(
                  auxdibot,
                  'STICKY_ROLE_EXISTS',
                  'This role is already added as a sticky role!',
                  interaction,
               );
            }
            if (
               role &&
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               interaction.data.guild.roles.comparePositions(role.id, interaction.data.member.roles.highest) <= 0
            ) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER',
                  'This role has a higher or equal position than your highest role!',
                  interaction,
               );
            }
            if (
               role &&
               interaction.data.guild.members.me &&
               interaction.data.guild.roles.comparePositions(
                  role.id,
                  interaction.data.guild.members.me.roles.highest,
               ) >= 0
            ) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER_BOT',
                  "This role has a higher position than Auxdibot's highest role!",
                  interaction,
               );
            }
            if (!testLimit(server.sticky_roles, Limits.STICKY_ROLE_DEFAULT_LIMIT)) {
               return await handleError(
                  auxdibot,
                  'STICKY_ROLES_LIMIT_EXCEEDED',
                  'You have too many sticky roles!',
                  interaction,
               );
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { sticky_roles: { push: role.id } },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '📝 Added Sticky Role';
            successEmbed.description = `Added <@&${role.id}> to the sticky roles.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Added ${role.name} to sticky roles.`,
               type: LogAction.STICKY_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'remove',
         info: {
            module: Modules['Settings'],
            description:
               "Remove a role that is kept when a member rejoins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /sticky_roles list.",
            usageExample: '/sticky_roles remove [role] [index]',
            permission: 'settings.sticky_roles.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const role = interaction.options.getRole('role'),
               index = interaction.options.getNumber('index');
            const server = interaction.data.guildData;
            const stickyRoleID =
               role != null
                  ? server.sticky_roles.find((val: string) => role != null && val == role.id)
                  : index
                  ? server.sticky_roles[index - 1]
                  : undefined;
            if (!stickyRoleID) {
               return await handleError(
                  auxdibot,
                  'STICKY_ROLE_NOT_FOUND',
                  "This role isn't added as a sticky role!",
                  interaction,
               );
            }
            const stickyRole = interaction.data.guild.roles.cache.get(stickyRoleID);
            if (stickyRole) {
               if (
                  interaction.data.member.id != interaction.data.guild.ownerId &&
                  !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
                  stickyRole.comparePositionTo(interaction.data.member.roles.highest) <= 0
               ) {
                  return await handleError(
                     auxdibot,
                     'ROLE_POSITION_HIGHER',
                     'This role has a higher or equal position than your highest role!',
                     interaction,
                  );
               }
               if (
                  stickyRole &&
                  interaction.data.guild.members.me &&
                  stickyRole.comparePositionTo(interaction.data.guild.members.me.roles.highest) >= 0
               ) {
                  return await handleError(
                     auxdibot,
                     'ROLE_POSITION_HIGHER_BOT',
                     "This role has a higher position than Auxdibot's highest role!",
                     interaction,
                  );
               }
            }

            server.sticky_roles.splice(server.sticky_roles.indexOf(stickyRoleID), 1);
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { sticky_roles: server.sticky_roles },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '📝 Removed Sticky Role';
            successEmbed.description = `Removed <@&${stickyRoleID}> from the sticky roles.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Removed (Role ID: ${stickyRoleID}) from the sticky roles.`,
               type: LogAction.STICKY_ROLE_REMOVED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'list',
         info: {
            module: Modules['Settings'],
            description: 'List the roles that are kept when a member rejoins the server.',
            usageExample: '/sticky_roles list',
            permission: 'settings.sticky_roles.list',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            successEmbed.title = '📝 Sticky Roles';
            successEmbed.description = server.sticky_roles.reduce(
               (accumulator: string, value: string, index: number) => `${accumulator}\n**${index + 1})** <@&${value}>`,
               '',
            );
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = stickyRolesCommand;
