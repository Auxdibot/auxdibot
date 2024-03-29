import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { findCommand } from '@/modules/features/commands/findCommand';
import handleError from '@/util/handleError';
import { removeCommandPermission } from '@/modules/features/commands/removeCommandPermission';
import { EmbedBuilder } from 'discord.js';
export default <AuxdibotSubcommand>{
   name: 'delete',
   group: 'rules',
   info: {
      module: Modules['Settings'],
      description: 'Clear the rules set for a command.',
      usageExample: '/commands rules delete',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const command = interaction.options.getString('command', true);
      const [commandName, ...subcommand] = command.replace(/^\//g, '').split(' ');
      const commandData = findCommand(auxdibot, commandName, subcommand);
      if (!commandData)
         return handleError(auxdibot, 'INVALID_COMMAND', 'This is not an Auxdibot command!', interaction);
      return await removeCommandPermission(auxdibot, interaction.guildId, commandName, subcommand)
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
            embed.description = `The rules configured for the command \`/${command.replace(
               /^\//g,
               '',
            )}\` have been cleared.`;

            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
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
