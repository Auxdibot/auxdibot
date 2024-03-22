import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';

export function findCommand(
   auxdibot: Auxdibot,
   command: string,
   subcommand?: string[],
): { commandData: AuxdibotCommand; subcommandData?: AuxdibotSubcommand } | undefined {
   const commandData = auxdibot.commands.get(command),
      subcommandData = commandData?.subcommands?.find((i) =>
         subcommand.length > 1 ? i.name == subcommand[0] && i.group == subcommand[1] : i.name == subcommand[0],
      );
   if (!commandData || (subcommand.length && !subcommandData)) {
      return undefined;
   }
   return { commandData, subcommandData };
}