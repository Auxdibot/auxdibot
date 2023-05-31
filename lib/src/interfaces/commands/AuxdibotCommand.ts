import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

import CommandInfo from './CommandInfo';
import { AuxdibotSubcommand } from './AuxdibotSubcommand';
import AuxdibotCommandInteraction from './AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from './AuxdibotCommandData';

interface AuxdibotCommand {
   data:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
      | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>;
   execute(interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>): any;
   info: CommandInfo;
   subcommands?: AuxdibotSubcommand[];
}

export default AuxdibotCommand;
