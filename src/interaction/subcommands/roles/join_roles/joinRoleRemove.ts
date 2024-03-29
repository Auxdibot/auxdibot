import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import removeJoinRole from '@/modules/features/roles/join_roles/removeJoinRole';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const joinRoleRemove = <AuxdibotSubcommand>{
   name: 'remove',
   info: {
      module: Modules['Roles'],
      description:
         "Remove a role that is assigned when a member joins the server. If you've deleted the role, use the index parameter, which is the placement of the item on /join_roles list.",
      usageExample: '/join_roles remove [role] [index]',
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

      removeJoinRole(auxdibot, interaction.guild, role, joinRoleID, interaction.user)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '👋 Removed Join Role';
            successEmbed.description = `Removed <@&${joinRoleID}> from the join roles.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch(async (x) => {
            await handleError(auxdibot, 'FAILED_JOIN_ROLE_REMOVE', x.message, interaction);
         });
   },
};
