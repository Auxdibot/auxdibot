import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

import CommandInfo from '../types/CommandInfo';
import { AuxdibotSubcommand } from '../types/AuxdibotSubcommand';
import AuxdibotCommandInteraction from './AuxdibotCommandInteraction';
import BaseAuxdibotCommandData from '../types/commandData/BaseAuxdibotCommandData';

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
