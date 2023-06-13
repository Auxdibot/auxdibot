import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { PermissionsBitField } from 'discord.js';

export const joinRoleRemove = <AuxdibotSubcommand>{
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
};
