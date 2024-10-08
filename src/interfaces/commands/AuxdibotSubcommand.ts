import CommandInfo from './CommandInfo';
import AuxdibotCommandInteraction from './AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from './AuxdibotCommandData';
import { Auxdibot } from '@/Auxdibot';
import { AutocompleteInteraction } from 'discord.js';

export interface AuxdibotSubcommand {
   name: string;
   group?: string;
   autocomplete?: { [k: string]: (auxdibot: Auxdibot, interaction: AutocompleteInteraction) => void };
   info: CommandInfo;
   execute?(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>): unknown;
}
