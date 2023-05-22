import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/enums/Log';
import Modules from '@util/constants/Modules';

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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const settings = await interaction.data.guildData.fetchSettings();
            const role = interaction.options.getRole('role', true);
            if (role.id == interaction.data.guild.roles.everyone.id) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This is the everyone role!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (settings.join_roles.find((val: string) => role != null && val == role.id)) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This role is already added!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               role.position >= interaction.data.member.roles.highest.position
            ) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This role is higher than yours!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (
               interaction.data.guild.members.me &&
               role.position >= interaction.data.guild.members.me.roles.highest.position
            ) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This role is higher than Auxdibot's highest role!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const add_join_role = await interaction.data.guildData.addJoinRole(role.id);
            if (typeof add_join_role == 'object' && 'error' in add_join_role) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = add_join_role.error;
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
            successEmbed.title = '👋 Added Join Role';
            successEmbed.description = `Added <@&${role.id}> to the join roles.`;
            await interaction.data.guildData.log(interaction.data.guild, {
               user_id: interaction.data.member.id,
               description: `Added (Role ID: ${role.id}) to the join roles.`,
               type: LogType.JOIN_ROLE_ADDED,
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data || !interaction.memberPermissions) return;
            const role = interaction.options.getRole('role'),
               index = interaction.options.getNumber('index');
            const settings = await interaction.data.guildData.fetchSettings();
            const joinRoleID =
               role != null
                  ? settings.join_roles.find((val: string) => role != null && val == role.id)
                  : index
                  ? settings.join_roles[index - 1]
                  : undefined;

            if (!joinRoleID) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This join role doesn't exist!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            const joinRole = interaction.data.guild.roles.cache.get(joinRoleID);
            if (
               joinRole &&
               interaction.data.member.id != interaction.data.guild.ownerId &&
               !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
               joinRole.comparePositionTo(interaction.data.member.roles.highest) <= 0
            ) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = 'This role is higher than yours!';
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            if (
               joinRole &&
               interaction.data.guild.members.me &&
               joinRole.comparePositionTo(interaction.data.guild.members.me.roles.highest) >= 0
            ) {
               const errorEmbed = Embeds.ERROR_EMBED.toJSON();
               errorEmbed.description = "This role is higher than Auxdibot's highest role!";
               return await interaction.reply({ embeds: [errorEmbed] });
            }
            settings.join_roles.splice(settings.join_roles.indexOf(joinRoleID), 1);
            await settings.save({ validateBeforeSave: false });
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
            successEmbed.title = '👋 Removed Join Role';
            successEmbed.description = `Removed <@&${joinRoleID}> from the join roles.`;
            await interaction.data.guildData.log(interaction.data.guild, {
               user_id: interaction.data.member.id,
               description: `Removed (Role ID: ${joinRoleID}) from the sticky roles.`,
               type: LogType.JOIN_ROLE_REMOVED,
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
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const successEmbed = Embeds.INFO_EMBED.toJSON();
            const settings = await interaction.data.guildData.fetchSettings();
            successEmbed.title = '👋 Join Roles';
            successEmbed.description = settings.join_roles.reduce(
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
