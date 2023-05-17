import CommandInfo from './CommandInfo';
import AuxdibotCommandInteraction from '../templates/AuxdibotCommandInteraction';
import BaseAuxdibotCommandData from './commandData/BaseAuxdibotCommandData';

export interface AuxdibotSubcommand {
   name: string;
   info: CommandInfo;
   execute(interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>): any;
}
