import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { findCommand } from '@/modules/features/commands/findCommand';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'require',
   group: 'role',
   info: {
      module: Modules['Settings'],
      description: 'Require a role to use a command.',
      usageExample: '/commands role require (command) (role)',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const commandStr = interaction.options.getString('command', true),
         role = interaction.options.getRole('role', true);
      if (!commandStr)
         return handleError(auxdibot, 'INVALID_COMMAND', 'Please provide a valid command name.', interaction);

      const [commandName, ...subcommand] = commandStr.replace(/^\//g, '').split(' ');
      const commandData = findCommand(auxdibot, commandName, subcommand);
      if (!commandData)
         return handleError(auxdibot, 'INVALID_COMMAND', 'This is not an Auxdibot command!', interaction);
      await updateCommandPermissions(auxdibot, interaction.guildId, commandName, subcommand, {
         roles: [role.id],
      })
         .then(async (data) => {
            if (!data) {
               return handleError(
                  auxdibot,
                  'COMMAND_PERMISSIONS_ERROR',
                  'There was an error updating the command permissions.',
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Command Permissions Updated';
            embed.description = `The command \`/${commandStr.replace(/^\//g, '')}\` can exclusively be utilized by <@&${
               role.id
            }> and additional role requirements that you have specified.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'COMMAND_PERMISSIONS_ERROR',
               'There was an error updating the command permissions.',
               interaction,
            );
         });
   },
};
