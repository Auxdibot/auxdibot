import { AutocompleteInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

import CommandInfo from './CommandInfo';
import { AuxdibotSubcommand } from './AuxdibotSubcommand';
import AuxdibotCommandInteraction from './AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from './AuxdibotCommandData';
import { Auxdibot } from '@/Auxdibot';

interface AuxdibotCommand {
   data:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
      | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>;
   execute?(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>): unknown;
   info: CommandInfo;
   autocomplete?: { [k: string]: (auxdibot: Auxdibot, interaction: AutocompleteInteraction) => void };
   subcommands?: AuxdibotSubcommand[];
}

export default AuxdibotCommand;
