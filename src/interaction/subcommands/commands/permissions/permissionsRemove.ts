import Modules from '@/constants/bot/commands/Modules';
import { permissionAutocomplete } from '@/interaction/autocomplete/permission';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { findCommand } from '@/modules/features/commands/findCommand';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';
import handleError from '@/util/handleError';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'remove',
   group: 'permissions',
   autocomplete: { permission: permissionAutocomplete },
   info: {
      module: Modules['Settings'],
      description: 'Remove a Discord permission requirement from a command.',
      usageExample: '/commands permissions remove (command) (permission)',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const commandStr = interaction.options.getString('command', true),
         permission = interaction.options.getString('permission', true);
      if (!commandStr)
         return handleError(auxdibot, 'INVALID_COMMAND', 'Please provide a valid command name.', interaction);

      const [commandName, ...subcommand] = commandStr.replace(/^\//g, '').split(' ');
      const commandData = findCommand(auxdibot, commandName, subcommand);
      if (!commandData)
         return handleError(auxdibot, 'INVALID_COMMAND', 'This is not an Auxdibot command!', interaction);

      const permissionKey = Object.keys(PermissionFlagsBits).find(
         (key) => key.toLowerCase() === permission.toLowerCase(),
      );
      if (permissionKey === undefined) {
         return handleError(auxdibot, 'INVALID_PERMISSION', 'Please provide a valid permission.', interaction);
      }

      await updateCommandPermissions(
         auxdibot,
         interaction.guildId,
         commandName,
         subcommand,
         {
            discord_permissions: [permissionKey],
         },
         true,
      )
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
            embed.description = `The permission \`${permission}\` is no longer required in order to use the command \`/${commandStr.replace(
               /^\//g,
               '',
            )}\`.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'COMMAND_PERMISSIONS_ERROR',
               x.message ?? 'There was an error updating the command permissions.',
               interaction,
            );
         });
   },
};
