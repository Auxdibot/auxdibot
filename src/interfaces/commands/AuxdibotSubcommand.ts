import CommandInfo from './CommandInfo';
import AuxdibotCommandInteraction from './AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from './AuxdibotCommandData';
import { Auxdibot } from '../Auxdibot';

export interface AuxdibotSubcommand {
   name: string;
   group?: string;
   info: CommandInfo;
   execute?(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>): unknown;
}
