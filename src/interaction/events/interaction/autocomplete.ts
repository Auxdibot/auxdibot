import { Auxdibot } from '@/Auxdibot';
import { AutocompleteInteraction } from 'discord.js';

export function autocomplete(auxdibot: Auxdibot, autocomplete: AutocompleteInteraction) {
   if (!auxdibot.commands) return;
   const command = auxdibot.commands.get(autocomplete.commandName);
   if (!command) return;

   const subcommandArgs = [
      autocomplete.options.getSubcommandGroup(false),
      autocomplete.options.getSubcommand(false),
   ].filter((i) => i);

   const commandData =
      command.subcommands?.find((subcommand) =>
         subcommand && subcommandArgs.length > 1
            ? subcommand.name == subcommandArgs[1] && subcommand.group == subcommandArgs[0]
            : subcommand.name == subcommandArgs[0] && subcommand.group == null,
      ) || command;

   if (!commandData.autocomplete) return;
   const option = autocomplete.options.getFocused(true);
   const optionAutocomplete = commandData.autocomplete[option.name];
   if (optionAutocomplete) {
      optionAutocomplete(auxdibot, autocomplete);
   }
}
