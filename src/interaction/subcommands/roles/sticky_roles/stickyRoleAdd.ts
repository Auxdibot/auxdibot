import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { PermissionsBitField } from 'discord.js';

export const stickyRoleAdd = <AuxdibotSubcommand>{
   name: 'add',
   info: {
      module: Modules['Roles'],
      description: 'Add a role to be kept when a member rejoins the server.',
      usageExample: '/sticky_roles add (role)',
      permission: 'roles.sticky_roles.add',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.memberPermissions) return;
      const role = interaction.options.getRole('role', true);
      const server = interaction.data.guildData;
      if (role.id == interaction.data.guild.roles.everyone.id) {
         return await handleError(auxdibot, 'STICKY_ROLE_EVERYONE', 'This is the everyone role, silly!', interaction);
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
         interaction.data.guild.roles.comparePositions(role.id, interaction.data.guild.members.me.roles.highest) >= 0
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
};
