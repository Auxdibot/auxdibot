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

export const joinRoleAdd = <AuxdibotSubcommand>{
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
         return await handleError(auxdibot, 'JOIN_ROLE_EVERYONE', 'This is the everyone role, silly!', interaction);
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
         return await handleError(auxdibot, 'JOIN_ROLES_LIMIT_EXCEEDED', 'You have too many join roles!', interaction);
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
};
