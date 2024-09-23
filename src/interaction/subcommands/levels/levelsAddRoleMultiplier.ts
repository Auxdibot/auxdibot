import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createRoleMultiplier from '@/modules/features/levels/createRoleMultiplier';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsAddRoleMultiplier = <AuxdibotSubcommand>{
   name: 'add_role',
   group: 'multipliers',
   info: {
      module: Modules['Levels'],
      description: 'Add a role to the multiplier list.',
      usageExample: '/levels multipliers add_role (role) (multiplier)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const role = interaction.options.getRole('role', true);
      const multiplier = interaction.options.getNumber('multiplier', true);
      if (multiplier < 0 || multiplier > 999) {
         return await handleError(auxdibot, 'MULTIPLIER_INVALID', 'Multiplier must be between 0 and 999.', interaction);
      }
      createRoleMultiplier(auxdibot, interaction.guild, interaction.user, { id: role.id, multiplier })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Role Multiplier Added';
            embed.description = `Successfully added <@&${role.id}> (with a multiplier of \`x${multiplier}\`) as a role multiplier!`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'ROLE_MULTIPLIER_ADD_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't add that role multiplier.",
               interaction,
            );
         });
   },
};
