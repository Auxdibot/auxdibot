import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import removeStickyRole from '@/modules/features/roles/sticky_roles/removeStickyRole';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
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
      }

      removeStickyRole(auxdibot, interaction.guild, role, stickyRoleID, interaction.user)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '📝 Removed Sticky Role';
            successEmbed.description = `Removed role <@&${stickyRoleID}> from the sticky roles.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch(async (x) => {
            await handleError(auxdibot, 'FAILED_STICKY_ROLE_REMOVE', x.message, interaction);
         });
   },
};
