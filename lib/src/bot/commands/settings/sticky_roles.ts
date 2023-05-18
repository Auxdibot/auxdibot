import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import AuxdibotCommand from '@util/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import AuxdibotCommandInteraction from '@util/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/Log';

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
      help: {
         commandCategory: 'Settings',
         name: '/sticky_roles',
         description: 'Change the roles that are kept when a member rejoins the server.',
         usageExample: '/sticky_roles (add|remove|list)',
      },
      permission: 'settings.sticky_roles',
   },
   subcommands: [
      {
         name: 'add',
         info: {
            help: {
               commandCategory: 'Settings',
               name: '/sticky_roles add',
               description: 'Add a role to be kept when a member rejoins the server.',
               usageExample: '/sticky_roles add (role)',
            },
            permission: 'settings.sticky_roles.add',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const role = interaction.options.getRole('role', true);
            const settings = await interaction.data.guildData.fetchSettings();
            if (role.id == interaction.data.guild.roles.everyone.id) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This is the everyone role or the role doesn't exist!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (settings.sticky_roles.find((val: string) => role != null && val == role.id)) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This role is already added!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (
               role &&
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               interaction.data.guild.roles.comparePositions(role.id, interaction.data.member.roles.highest) <= 0
            ) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This role is higher than yours!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (
               role &&
               interaction.data.guild.members.me &&
               interaction.data.guild.roles.comparePositions(
                  role.id,
                  interaction.data.guild.members.me.roles.highest,
               ) >= 0
            ) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This role is higher than Auxdibot's highest role!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            settings.addStickyRole(role.id);
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
            successEmbed.title = '📝 Added Sticky Role';
            successEmbed.description = `Added <@&${role.id}> to the sticky roles.`;
            await interaction.data.guildData.log({
               user_id: interaction.data.member.id,
               description: `Added ${role.name} to sticky roles.`,
               type: LogType.STICKY_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'remove',
         info: {
            help: {
               commandCategory: 'Settings',
               name: '/sticky_roles remove',
               description:
                  "Remove a role that is kept when a member rejoins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /sticky_roles list.",
               usageExample: '/sticky_roles remove [role] [index]',
            },
            permission: 'settings.sticky_roles.remove',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const role = interaction.options.getRole('role'),
               index = interaction.options.getNumber('index');
            const settings = await interaction.data.guildData.fetchSettings();
            if (!role && !index) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'Please specify a role or index!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }

            const stickyRoleID =
               role != null
                  ? settings.sticky_roles.find((val: string) => role != null && val == role.id)
                  : index
                  ? settings.sticky_roles[index - 1]
                  : undefined;
            if (!stickyRoleID) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This join role doesn't exist!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const stickyRole = interaction.data.guild.roles.cache.get(stickyRoleID);
            if (stickyRole) {
               if (
                  interaction.data.member.id != interaction.data.guild.ownerId &&
                  !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
                  stickyRole.comparePositionTo(interaction.data.member.roles.highest) <= 0
               ) {
                  const errorEmbed = Embeds.ERROR_EMBED.toJSON();
                  errorEmbed.description = 'This role is higher than yours!';
                  return await interaction.reply({ embeds: [errorEmbed] });
               }
               if (
                  stickyRole &&
                  interaction.data.guild.members.me &&
                  stickyRole.comparePositionTo(interaction.data.guild.members.me.roles.highest) >= 0
               ) {
                  const errorEmbed = Embeds.ERROR_EMBED.toJSON();
                  errorEmbed.description = "This role is higher than Auxdibot's highest role!";
                  return await interaction.reply({ embeds: [errorEmbed] });
               }
            }

            settings.removeStickyRole(settings.sticky_roles.indexOf(stickyRoleID));
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
            successEmbed.title = '📝 Removed Sticky Role';
            successEmbed.description = `Removed <@&${stickyRoleID}> from the sticky roles.`;
            await interaction.data.guildData.log({
               user_id: interaction.data.member.id,
               description: `Removed (Role ID: ${stickyRoleID}) from the sticky roles.`,
               type: LogType.STICKY_ROLE_REMOVED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'list',
         info: {
            help: {
               commandCategory: 'Settings',
               name: '/sticky_roles list',
               description: 'List the roles that are kept when a member rejoins the server.',
               usageExample: '/sticky_roles list',
            },
            permission: 'settings.sticky_roles.list',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const settings = await interaction.data.guildData.fetchSettings();
            const successEmbed = Embeds.INFO_EMBED.toJSON();
            successEmbed.title = '📝 Sticky Roles';
            successEmbed.description = settings.sticky_roles.reduce(
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
