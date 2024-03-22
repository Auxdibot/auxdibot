import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { findCommand } from '@/modules/features/commands/findCommand';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'disable',
   group: 'usage',
   info: {
      module: Modules['Settings'],
      description: 'Disable the usage of a command.',
      usageExample: '/commands usage disable (command)',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const commandStr = interaction.options.getString('command', true);
      if (!commandStr)
         return handleError(auxdibot, 'INVALID_COMMAND', 'Please provide a valid command name.', interaction);

      const [commandName, ...subcommand] = commandStr.replace(/^\//g, '').split(' ');
      const commandData = findCommand(auxdibot, commandName, subcommand);
      if (!commandData)
         return handleError(auxdibot, 'INVALID_COMMAND', 'This is not an Auxdibot command!', interaction);
      if (
         !commandData.commandData.info.module.disableable ||
         commandData.subcommandData?.info.module.disableable === false
      ) {
         return handleError(auxdibot, 'COMMAND_PERMISSIONS_ERROR', 'This command cannot be disabled.', interaction);
      }
      await updateCommandPermissions(auxdibot, interaction.guildId, commandName, subcommand, {
         disabled: true,
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
            embed.description = `The command \`/${commandStr.replace(/^\//g, '')}\` has been disabled.`;
            return await interaction.reply({ embeds: [embed] });
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
