import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import massroleMembers from '@/modules/features/massrole/massroleMembers';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
export const massroleTake = <AuxdibotSubcommand>{
   name: 'take',
   info: {
      module: Modules['Roles'],
      description: 'Take away a role from every user.',
      usageExample: '/massrole take (role)',
      permission: 'massrole.take',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const role = interaction.options.getRole('role', true);
      if (role.position >= interaction.data.member.roles.highest.position) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER',
            'This role has a higher or equal position than your highest role!',
            interaction,
         );
      }
      massroleMembers(auxdibot, interaction.guild, role, false, interaction.user)
         .then(async (i) => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully took the role ${role} from ${i.toLocaleString()} members!`;
            await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'MASSROLE_ERROR_OCCURRED',
               'An error occurred attempting to use massrole!',
               interaction,
            );
         });
   },
};
