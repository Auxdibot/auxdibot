import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import handleError from '@/util/handleError';

const joinRolesCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('join_roles')
      .setDescription('Change the roles given when a member joins the server.')
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
                     'The index of the sticky role to remove, which is the placement of the item on /join_roles list',
                  ),
            ),
      )
      .addSubcommand((builder) =>
         builder.setName('list').setDescription('List the roles that are assigned when a member joins the server.'),
      ),
   info: {
      module: Modules['Settings'],
      description: 'Change the roles given when a member joins the server.',
      usageExample: '/join_roles (add|remove|list)',
      permission: 'settings.join_roles',
   },
   subcommands: [
      {
         name: 'add',
         info: {
            module: Modules['Settings'],
            description: 'Add a role to be assigned when a member joins the server.',
            usageExample: '/join_roles add (role)',
            permission: 'settings.join_roles.add',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const server = interaction.data.guildData;
            const role = interaction.options.getRole('role', true);
            if (role.id == interaction.data.guild.roles.everyone.id) {
               return await handleError(
                  auxdibot,
                  'JOIN_ROLE_EVERYONE',
                  'This is the everyone role, silly!',
                  interaction,
               );
            }
            if (server.join_roles.find((val: string) => role != null && val == role.id)) {
               return await handleError(
                  auxdibot,
                  'JOIN_ROLE_EXISTS',
                  'This role is already added as a join role!',
                  interaction,
               );
            }
            if (
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               role.position >= interaction.data.member.roles.highest.position
            ) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER',
                  'This role has a higher or equal position than your highest role!',
                  interaction,
               );
            }
            if (
               interaction.data.guild.members.me &&
               role.position >= interaction.data.guild.members.me.roles.highest.position
            ) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER_BOT',
                  "This role has a higher position than Auxdibot's highest role!",
                  interaction,
               );
            }
            if (!testLimit(server.sticky_roles, Limits.JOIN_ROLE_DEFAULT_LIMIT)) {
               return await handleError(
                  auxdibot,
                  'JOIN_ROLES_LIMIT_EXCEEDED',
                  'You have too many join roles!',
                  interaction,
               );
            }
            auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { sticky_roles: { push: role.id } },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '👋 Added Join Role';
            successEmbed.description = `Added <@&${role.id}> to the join roles.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Added (Role ID: ${role.id}) to the join roles.`,
               type: LogAction.JOIN_ROLE_ADDED,
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
               "Remove a role that is assigned when a member joins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /join_roles list.",
            usageExample: '/join_roles remove [role] [index]',
            permission: 'settings.join_roles.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const role = interaction.options.getRole('role'),
               index = interaction.options.getNumber('index');
            const server = interaction.data.guildData;
            const joinRoleID =
               role != null
                  ? server.join_roles.find((val: string) => role != null && val == role.id)
                  : index
                  ? server.join_roles[index - 1]
                  : undefined;

            if (!joinRoleID) {
               return await handleError(
                  auxdibot,
                  'JOIN_ROLE_NOT_FOUND',
                  "This role isn't added as a join role!",
                  interaction,
               );
            }
            const joinRole = interaction.data.guild.roles.cache.get(joinRoleID);
            if (
               joinRole &&
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               joinRole.comparePositionTo(interaction.data.member.roles.highest) <= 0
            ) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER',
                  'This role has a higher or equal position than your highest role!',
                  interaction,
               );
            }
            if (
               joinRole &&
               interaction.data.guild.members.me &&
               joinRole.comparePositionTo(interaction.data.guild.members.me.roles.highest) >= 0
            ) {
               return await handleError(
                  auxdibot,
                  'ROLE_POSITION_HIGHER_BOT',
                  "This role has a higher position than Auxdibot's highest role!",
                  interaction,
               );
            }
            server.join_roles.splice(server.sticky_roles.indexOf(joinRoleID), 1);
            auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { join_roles: server.join_roles },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '👋 Removed Join Role';
            successEmbed.description = `Removed <@&${joinRoleID}> from the join roles.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Removed (Role ID: ${joinRoleID}) from the sticky roles.`,
               type: LogAction.JOIN_ROLE_REMOVED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'list',
         info: {
            module: Modules['Settings'],
            description: 'List the roles that are assigned when a member joins the server.',
            usageExample: '/join_roles list',
            permission: 'settings.join_roles.list',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            const server = interaction.data.guildData;
            successEmbed.title = '👋 Join Roles';
            successEmbed.description = server.join_roles.reduce(
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
module.exports = joinRolesCommand;
