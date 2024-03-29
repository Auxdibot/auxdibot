import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import addStickyRole from '@/modules/features/roles/sticky_roles/addStickyRole';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const stickyRoleAdd = <AuxdibotSubcommand>{
   name: 'add',
   info: {
      module: Modules['Roles'],
      description: 'Add a role to be kept when a member rejoins the server.',
      usageExample: '/sticky_roles add (role)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.memberPermissions) return;
      const role = interaction.options.getRole('role', true);
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
      addStickyRole(auxdibot, interaction.guild, role, interaction.user)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '📝 Added Sticky Role';
            successEmbed.description = `Added <@&${role.id}> to the sticky roles.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch(async (x) => {
            await handleError(auxdibot, 'FAILED_STICKY_ROLE_ADD', x.message, interaction);
         });
   },
};
