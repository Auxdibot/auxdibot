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
   group: 'channel',
   info: {
      module: Modules['Settings'],
      description: '',
      usageExample: '/commands channel require (command) (channel)',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const commandStr = interaction.options.getString('command', true),
         channel = interaction.options.getChannel('channel', true);
      if (!commandStr)
         return handleError(auxdibot, 'INVALID_COMMAND', 'Please provide a valid command name.', interaction);

      const [commandName, ...subcommand] = commandStr.replace(/^\//g, '').split(' ');
      const commandData = findCommand(auxdibot, commandName, subcommand);
      if (!commandData)
         return handleError(auxdibot, 'INVALID_COMMAND', 'This is not an Auxdibot command!', interaction);
      await updateCommandPermissions(auxdibot, interaction.guildId, commandName, subcommand, {
         channels: [channel.id],
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
            embed.description = `The command \`/${commandStr.replace(/^\//g, '')}\`'s usage has been limited to <#${
               channel.id
            }>. (This does not include other channels added as requirements.)`;
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
