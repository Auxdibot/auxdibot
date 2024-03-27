import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { findCommand } from '@/modules/features/commands/findCommand';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'set',
   group: 'admin',
   info: {
      module: Modules['Settings'],
      description: 'Set whether a command is allowed only for Discord Administrators.',
      usageExample: '/commands admin set (command) (allowed)',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const commandStr = interaction.options.getString('command', true),
         allowed = interaction.options.getBoolean('admin_only', true);
      if (!commandStr)
         return handleError(auxdibot, 'INVALID_COMMAND', 'Please provide a valid command name.', interaction);

      const [commandName, ...subcommand] = commandStr.replace(/^\//g, '').split(' ');
      const commandData = findCommand(auxdibot, commandName, subcommand);
      if (!commandData)
         return handleError(auxdibot, 'INVALID_COMMAND', 'This is not an Auxdibot command!', interaction);
      if (interaction.user.id != interaction.guild.ownerId)
         return handleError(
            auxdibot,
            'NO_PERMISSION',
            'You must be the server owner to set permissions for Discord Administrators.',
            interaction,
         );
      await updateCommandPermissions(auxdibot, interaction.guildId, commandName, subcommand, {
         admin_only: allowed,
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
            embed.description = allowed
               ? `The command \`/${commandStr.replace(/^\//g, '')}\` is now only allowed for Discord Administrators.`
               : `The command \`${commandStr.replace(
                    /\//g,
                    '',
                 )}\` is now allowed for everyone. (This will not include members/roles that are blacklisted from using the command.)`;
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
