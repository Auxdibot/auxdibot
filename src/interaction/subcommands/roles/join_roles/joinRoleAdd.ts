import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import addJoinRole from '@/modules/features/roles/join_roles/addJoinRole';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

import { PermissionsBitField } from 'discord.js';

export const joinRoleAdd = <AuxdibotSubcommand>{
   name: 'add',
   info: {
      module: Modules['Roles'],
      description: 'Add a role to be assigned when a member joins the server.',
      usageExample: '/join_roles add (role)',
      permission: 'roles.join_roles.add',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.memberPermissions) return;
      const role = interaction.options.getRole('role', true);
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

      addJoinRole(auxdibot, interaction.guild, role, interaction.user)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '👋 Added Join Role';
            successEmbed.description = `Added <@&${role.id}> to the join roles.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch(async (x) => {
            await handleError(auxdibot, 'FAILED_JOIN_ROLE_ADD', x.message, interaction);
         });
   },
};
