import CommandInfo from './CommandInfo';
import AuxdibotCommandInteraction from './AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from './AuxdibotCommandData';

export interface AuxdibotSubcommand {
   name: string;
   info: CommandInfo;
   execute(interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>): any;
}
