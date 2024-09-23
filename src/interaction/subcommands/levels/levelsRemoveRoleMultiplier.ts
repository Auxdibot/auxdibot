import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteRoleMultiplier from '@/modules/features/levels/deleteRoleMultiplier';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsRemoveRoleMultiplier = <AuxdibotSubcommand>{
   name: 'remove_role',
   group: 'multipliers',
   info: {
      module: Modules['Levels'],
      description: 'Remove a reward from the Level Rewards.',
      usageExample: '/levels multipliers remove_role (role|index)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;

      const server = interaction.data.guildData,
         role = interaction.options.getRole('role', false),
         index = interaction.options.getInteger('index', false);
      if (!role && !index) {
         return await handleError(auxdibot, 'ROLE_INVALID', 'You must provide a valid channel or index.', interaction);
      }
      const multiplier = server.role_multipliers.find((reward, i) => reward.id == role?.id || i == index - 1);
      if (!multiplier) {
         return await handleError(
            auxdibot,
            'ROLE_MULTIPLIER_NOT_FOUND',
            'The role multiplier specified does not exist!',
            interaction,
         );
      }
      deleteRoleMultiplier(auxdibot, interaction.guild, interaction.user, server.role_multipliers.indexOf(multiplier))
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Channel Multiplier Removed';
            embed.description = `Successfully removed the role multiplier for <@&${multiplier.id}>.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'ROLE_MULTIPLIER_REMOVE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't remove that role multiplier.",
               interaction,
            );
         });
   },
};
