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

export const stickyRoleRemove = <AuxdibotSubcommand>{
   name: 'remove',
   info: {
      module: Modules['Roles'],
      description:
         "Remove a role that is kept when a member rejoins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /sticky_roles list.",
      usageExample: '/sticky_roles remove [role] [index]',
      permission: 'roles.sticky_roles.remove',
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
};
